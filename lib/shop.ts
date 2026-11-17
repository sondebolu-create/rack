import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Shop = Database['public']['Tables']['shops']['Row'];
export type ShopPatch = Database['public']['Tables']['shops']['Update'];
export type GenderFocus = Shop['gender_focus'];
export type ShopImageKind = 'logo' | 'banner';

const BUCKET = 'shop-assets';

export const GENDER_OPTIONS: { id: GenderFocus; label: string }[] = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'both', label: 'Both' },
];

// ------------------------------------------------------------------ rules (shared by the wizard and publish checks)

/** "Fashion Nova!" -> "fashion-nova". Matches the DB check: ^[a-z0-9]+(-[a-z0-9]+)*$ */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type BasicsErrors = Partial<Record<'name' | 'slug' | 'description' | 'city' | 'categories', string>>;

export function validateShop(s: Pick<Shop, 'name' | 'slug' | 'description' | 'city' | 'categories'>): BasicsErrors {
  const e: BasicsErrors = {};
  if (!s.name.trim()) e.name = 'Enter your shop name.';
  else if (s.name.trim().length > 80) e.name = 'Keep it to 80 characters.';
  if (!s.slug) e.slug = 'Enter a shop address.';
  else if (!SLUG_RE.test(s.slug)) e.slug = 'Use lowercase letters, numbers and single dashes.';
  if ((s.description ?? '').length > 1000) e.description = 'Keep it to 1000 characters.';
  if (!(s.city ?? '').trim()) e.city = 'Enter your city.';
  if (s.categories.length === 0) e.categories = 'Pick at least one category.';
  return e;
}

export type Readiness = {
  /** Blocks publishing. */
  missing: string[];
  /** Worth doing, but does not block. */
  suggestions: string[];
};

/** What is missing before the shop can go live. The database enforces the same rules on publish. */
export function publishReadiness(s: Shop, publishedProducts: number): Readiness {
  const errors = validateShop(s);
  const missing = Object.values(errors);
  if (publishedProducts === 0) missing.push('Publish at least one product. Shoppers can’t see a shop with nothing in it.');
  const suggestions: string[] = [];
  if (!s.logo_url) suggestions.push('Add a logo.');
  if (!s.banner_url) suggestions.push('Add a banner.');
  if (!(s.description ?? '').trim()) suggestions.push('Add a short description.');
  return { missing, suggestions };
}

// ------------------------------------------------------------------ data

/** The signed-in vendor's shop (approve_vendor creates it as a draft). RLS limits rows to their own. */
export function useMyShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('shops').select('*').order('created_at').limit(1).maybeSingle();
    if (error) setFailed(true);
    setShop(data);
    if (data) {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', data.id)
        .eq('status', 'published');
      setPublishedCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { shop, setShop, publishedCount, loading, failed, reload };
}

export async function slugAvailable(slug: string, shopId: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('slug_available', { p_slug: slug, p_shop_id: shopId });
  return error ? null : data;
}

export async function saveShop(id: string, patch: ShopPatch): Promise<{ shop?: Shop; error?: string }> {
  const { data, error } = await supabase.from('shops').update(patch).eq('id', id).select('*').single();
  if (error) {
    if (error.code === '23505') return { error: 'That shop address is already taken.' };
    return { error: 'Could not save. Check your connection and try again.' };
  }
  return { shop: data };
}

/** Sets the shop live. The database refuses unless a product is published, so a stale screen can't get around it. */
export async function publishShop(id: string): Promise<{ shop?: Shop; error?: string }> {
  const { data, error } = await supabase.from('shops').update({ status: 'live' }).eq('id', id).select('*').single();
  if (!error) return { shop: data };
  if (error.message.startsWith('SHOP_NEEDS_PRODUCT')) return { error: 'Publish at least one product before going live.' };
  if (error.message.startsWith('SHOP_INCOMPLETE')) return { error: 'Add a city and at least one category before going live.' };
  return { error: 'Could not publish. Try again.' };
}

/** Takes the shop back to draft (hidden from shoppers). */
export const unpublishShop = (id: string) => saveShop(id, { status: 'draft' });

/**
 * Uploads an already-compressed image to shop-assets/<shop_id>/ (the folder the bucket policy allows), stores its
 * public URL on the shop, and removes the file it replaces.
 */
export async function uploadShopImage(shop: Shop, kind: ShopImageKind, uri: string): Promise<{ shop?: Shop; error?: string }> {
  const blob = await (await fetch(uri)).blob();
  const type = blob.type === 'image/png' || blob.type === 'image/webp' ? blob.type : 'image/jpeg';
  const path = `${shop.id}/${kind}-${Date.now()}.${type === 'image/jpeg' ? 'jpg' : type.slice(6)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type });
  if (error) return { error: 'Could not upload the image. Try again.' };

  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const old = kind === 'logo' ? shop.logo_url : shop.banner_url;
  const saved = await saveShop(shop.id, kind === 'logo' ? { logo_url: url } : { banner_url: url });
  if (saved.error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return saved;
  }
  const oldPath = old?.split(`/${BUCKET}/`)[1];
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
  return saved;
}

export async function removeShopImage(shop: Shop, kind: ShopImageKind): Promise<{ shop?: Shop; error?: string }> {
  const old = kind === 'logo' ? shop.logo_url : shop.banner_url;
  const saved = await saveShop(shop.id, kind === 'logo' ? { logo_url: null } : { banner_url: null });
  const oldPath = old?.split(`/${BUCKET}/`)[1];
  if (!saved.error && oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
  return saved;
}
