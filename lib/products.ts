import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { GenderFocus } from '@/lib/shop';
import { SIZES, type Size } from '@/lib/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductStatus = ProductRow['status'];

/** A product with what the list needs: photos (for the thumbnail) and variants (for stock). */
export type ListedProduct = ProductRow & {
  product_images: { url: string; alt: string; position: number }[];
  product_variants: { id: string; size: Size; colour_name: string; colour_hex: string; stock: number }[];
};

export const MAX_PHOTOS = 6;
export const LOW_STOCK = 3;
const BUCKET = 'product-images';
const SELECT = '*, product_images(url, alt, position), product_variants(id, size, colour_name, colour_hex, stock)';

// ------------------------------------------------------------------ list helpers

export const totalStock = (p: ListedProduct) => p.product_variants.reduce((n, v) => n + v.stock, 0);
/** Any variant at 3 or fewer (including sold out). */
export const isLowStock = (p: ListedProduct) => p.product_variants.some((v) => v.stock <= LOW_STOCK);
export const coverUrl = (p: ListedProduct) => [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url ?? null;

export async function listMyProducts(shopId: string) {
  return supabase.from('products').select(SELECT).eq('shop_id', shopId).order('created_at', { ascending: false }).returns<ListedProduct[]>();
}
export const loadProduct = (id: string) => supabase.from('products').select(SELECT).eq('id', id).maybeSingle<ListedProduct>();

// ------------------------------------------------------------------ money (whole naira in the form, kobo in the DB)

/** "1250000" or "12,5a" -> "125". Digits only, capped at 7 (₦9,999,999), thousands separators added. */
export function formatNairaInput(text: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 7);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export const nairaToMinor = (text: string) => (Number(text.replace(/,/g, '')) || 0) * 100;
export const minorToNairaText = (minor: number) => (minor ? formatNairaInput(String(Math.round(minor / 100))) : '');

// ------------------------------------------------------------------ form model

export type PhotoState = 'ready' | 'uploading' | 'done' | 'error';
/** A photo in the form: either already stored (`remote`) or a local, already-compressed file waiting to upload. */
export type PhotoItem = { key: string; uri: string; remote: boolean; state: PhotoState };
export type ColourItem = { key: string; name: string; hex: string };

export type ProductForm = {
  name: string;
  description: string;
  category: string;
  gender: GenderFocus;
  priceText: string;
  photos: PhotoItem[];
  sizes: Size[];
  colours: ColourItem[];
  /** Stock as typed, keyed `${size}|${colour.key}`. */
  stock: Record<string, string>;
};

export const cellKey = (size: Size, colourKey: string) => `${size}|${colourKey}`;
let counter = 0;
export const newKey = () => `k${Date.now().toString(36)}${counter++}`;

export function emptyForm(gender: GenderFocus): ProductForm {
  return { name: '', description: '', category: '', gender, priceText: '', photos: [], sizes: [], colours: [], stock: {} };
}

export function toForm(p: ListedProduct): ProductForm {
  const colours: ColourItem[] = [];
  const stock: Record<string, string> = {};
  for (const v of p.product_variants) {
    let c = colours.find((x) => x.name === v.colour_name);
    if (!c) colours.push((c = { key: newKey(), name: v.colour_name, hex: v.colour_hex }));
    stock[cellKey(v.size, c.key)] = String(v.stock);
  }
  return {
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    gender: p.gender,
    priceText: minorToNairaText(p.price_minor),
    photos: [...p.product_images]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ key: newKey(), uri: i.url, remote: true, state: 'done' as const })),
    sizes: SIZES.filter((s) => p.product_variants.some((v) => v.size === s)),
    colours,
    stock,
  };
}

const stockOf = (f: ProductForm, size: Size, c: ColourItem) => Math.max(0, Math.min(9999, Number(f.stock[cellKey(size, c.key)]) || 0));

/** The sizes x colours grid as rows ready for the database. */
export function variantsOf(f: ProductForm) {
  return f.sizes.flatMap((size) =>
    f.colours.map((c) => ({ size, colour_name: c.name.trim(), colour_hex: c.hex.toLowerCase(), stock: stockOf(f, size, c) })),
  );
}

// ------------------------------------------------------------------ validation

export type FormErrors = Partial<Record<'name' | 'category' | 'price' | 'photos' | 'variants' | 'colours', string>>;
const HEX = /^#[0-9a-fA-F]{6}$/;

/** `publish` adds the rules a shopper-visible product needs: a photo, a price and something in stock. */
export function validateProduct(f: ProductForm, publish: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim()) e.name = 'Enter a product name.';
  if (!f.category) e.category = 'Choose a category.';
  const names = f.colours.map((c) => c.name.trim().toLowerCase());
  if (f.colours.some((c) => !c.name.trim())) e.colours = 'Give every colour a name.';
  else if (new Set(names).size !== names.length) e.colours = 'Two colours have the same name.';
  else if (f.colours.some((c) => !HEX.test(c.hex))) e.colours = 'Pick a colour for every swatch.';
  if (publish) {
    if (f.photos.length === 0) e.photos = 'Add at least one photo.';
    if (nairaToMinor(f.priceText) <= 0) e.price = 'Enter a price.';
    if (!variantsOf(f).some((v) => v.stock > 0)) e.variants = 'Pick at least one size and colour, and enter stock for it.';
  }
  return e;
}

// ------------------------------------------------------------------ saving

export type SaveTarget = 'draft' | 'published' | 'keep';
export type SaveResult = { id?: string; error?: string; photoFailed?: boolean };

const PUBLISH_ERRORS: [string, string][] = [
  ['PRODUCT_NEEDS_PRICE', 'Enter a price before publishing.'],
  ['PRODUCT_NEEDS_PHOTO', 'Add at least one photo before publishing.'],
  ['PRODUCT_NEEDS_STOCK', 'Add a size and colour with stock before publishing.'],
];
const pathOf = (url: string) => url.split(`/${BUCKET}/`)[1];

/**
 * Saves in a fixed order so a failure part-way leaves a valid draft the vendor can retry:
 * product row (as a draft) -> upload new photos -> photo rows -> variants -> status last.
 * `onPhoto` reports each upload so the form can show progress and offer a retry on the one that failed.
 */
export async function saveProduct(
  shopId: string,
  productId: string | null,
  currentStatus: ProductStatus,
  f: ProductForm,
  target: SaveTarget,
  onPhoto: (key: string, state: PhotoState, finalUri?: string) => void,
): Promise<SaveResult> {
  const fields = {
    name: f.name.trim(),
    description: f.description.trim() || null,
    category: f.category,
    gender: f.gender,
    price_minor: nairaToMinor(f.priceText),
  };

  let id = productId;
  if (id) {
    const { error } = await supabase.from('products').update(fields).eq('id', id);
    if (error) return { error: 'Could not save. Check your connection and try again.' };
  } else {
    const { data, error } = await supabase.from('products').insert({ ...fields, shop_id: shopId, status: 'draft' }).select('id').single();
    if (error || !data) return { error: 'Could not save. Check your connection and try again.' };
    id = data.id;
  }

  // Photos: upload the new ones one at a time.
  const final: { url: string; alt: string }[] = [];
  for (const [i, p] of f.photos.entries()) {
    if (p.remote) {
      final.push({ url: p.uri, alt: '' });
      continue;
    }
    onPhoto(p.key, 'uploading');
    try {
      const blob = await (await fetch(p.uri)).blob();
      const type = blob.type === 'image/png' || blob.type === 'image/webp' ? blob.type : 'image/jpeg';
      const path = `${shopId}/${id}/${Date.now()}-${i}.${type === 'image/jpeg' ? 'jpg' : type.slice(6)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type });
      if (error) throw error;
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      onPhoto(p.key, 'done', url);
      final.push({ url, alt: '' });
    } catch {
      onPhoto(p.key, 'error');
      return { id, photoFailed: true, error: 'A photo did not upload. Your details are saved. Retry the photo, or remove it.' };
    }
  }

  const { data: oldImages } = await supabase.from('product_images').select('url').eq('product_id', id);
  const del = await supabase.from('product_images').delete().eq('product_id', id);
  if (del.error) return { id, error: 'Could not update the photos. Try again.' };
  if (final.length) {
    const rows = final.map((img, position) => ({ product_id: id, url: img.url, alt: `${fields.name}, photo ${position + 1}`, position }));
    const ins = await supabase.from('product_images').insert(rows);
    if (ins.error) return { id, error: 'Could not update the photos. Try again.' };
  }
  const keep = new Set(final.map((i) => i.url));
  const orphans = (oldImages ?? []).filter((o) => !keep.has(o.url)).map((o) => pathOf(o.url)).filter(Boolean);
  if (orphans.length) await supabase.storage.from(BUCKET).remove(orphans);

  // Variants: upsert the grid, then drop what was removed (or zero it if an order still points at it).
  const wanted = variantsOf(f);
  if (wanted.length) {
    const up = await supabase.from('product_variants').upsert(wanted.map((v) => ({ ...v, product_id: id })), { onConflict: 'product_id,size,colour_name' });
    if (up.error) return { id, error: 'Could not save sizes and colours. Try again.' };
  }
  const { data: existing } = await supabase.from('product_variants').select('id, size, colour_name').eq('product_id', id);
  const wantedKeys = new Set(wanted.map((v) => `${v.size}|${v.colour_name}`));
  for (const v of existing ?? []) {
    if (wantedKeys.has(`${v.size}|${v.colour_name}`)) continue;
    const r = await supabase.from('product_variants').delete().eq('id', v.id);
    if (r.error) await supabase.from('product_variants').update({ stock: 0 }).eq('id', v.id);
  }

  // Status last, so the database's publish check sees the photos and stock just written.
  const nextStatus: ProductStatus = target === 'keep' ? currentStatus : target;
  if (nextStatus !== (productId ? currentStatus : 'draft')) {
    const r = await supabase.from('products').update({ status: nextStatus }).eq('id', id);
    if (r.error) return { id, error: PUBLISH_ERRORS.find(([c]) => r.error.message.startsWith(c))?.[1] ?? 'Could not change the status. Try again.' };
  }
  return { id };
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<{ error?: string }> {
  const { error } = await supabase.from('products').update({ status }).eq('id', id);
  if (!error) return {};
  return { error: PUBLISH_ERRORS.find(([c]) => error.message.startsWith(c))?.[1] ?? 'Could not change the status. Try again.' };
}

/** Copies a product (as a draft) with its photo files and variants. */
export async function duplicateProduct(p: ListedProduct): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      shop_id: p.shop_id,
      name: `Copy of ${p.name}`.slice(0, 120),
      description: p.description,
      category: p.category,
      gender: p.gender,
      price_minor: p.price_minor,
      currency: p.currency,
      status: 'draft',
    })
    .select('id')
    .single();
  if (error || !data) return { error: 'Could not duplicate. Try again.' };
  const photos = [...p.product_images].sort((a, b) => a.position - b.position);
  for (const [i, img] of photos.entries()) {
    const from = pathOf(img.url);
    if (!from) continue;
    const to = `${p.shop_id}/${data.id}/${Date.now()}-${i}.${from.split('.').pop()}`;
    const cp = await supabase.storage.from(BUCKET).copy(from, to);
    if (cp.error) continue;
    const url = supabase.storage.from(BUCKET).getPublicUrl(to).data.publicUrl;
    await supabase.from('product_images').insert({ product_id: data.id, url, alt: img.alt, position: i });
  }
  if (p.product_variants.length) {
    await supabase
      .from('product_variants')
      .insert(p.product_variants.map((v) => ({ product_id: data.id, size: v.size, colour_name: v.colour_name, colour_hex: v.colour_hex, stock: v.stock })));
  }
  return { id: data.id };
}
