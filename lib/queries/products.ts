import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { categoryLabel, type GenderFilter, type StoreProduct } from '@/lib/categories';
import type { Currency } from '@/lib/format';
import type { ExploreTile, OutfitMatch, ProductCardData, ProductDetail, Size, SponsoredLook } from '@/lib/types';
import { SIZES } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import type { ProductRow } from '@/lib/products';

// Shopper-side product reads. Screens use these hooks and never call Supabase themselves. Row-level security
// decides what comes back (guests see published products of live shops); the filters here only narrow it.

type Img = { url: string; alt: string; position: number };
type Shop = { name: string; slug: string; city: string | null; status: string };
type Row = ProductRow & { shops: Shop; product_images: Img[]; product_variants: { size: Size; stock: number }[] };

const LISTING = '*, shops!inner(name, slug, city, status), product_images(url, alt, position), product_variants(size, stock)';
const bySize = (a: Size, b: Size) => SIZES.indexOf(a) - SIZES.indexOf(b);
const sortedImages = (r: { product_images: Img[] }) => [...r.product_images].sort((a, b) => a.position - b.position);

/** A published product of a live shop, as the lists and cards need it. Null when it has no photo yet. */
function toStoreProduct(r: Row): StoreProduct | null {
  const cover = sortedImages(r)[0];
  if (!cover) return null;
  return {
    id: r.id,
    vendorId: r.shops.slug,
    vendorName: r.shops.name,
    name: r.name,
    priceMinor: r.price_minor,
    currency: r.currency as Currency,
    image: { uri: cover.url },
    imageAlt: cover.alt || r.name,
    sizes: [...new Set(r.product_variants.filter((v) => v.stock > 0).map((v) => v.size))].sort(bySize),
    category: r.category,
    gender: r.gender,
  };
}
const present = <T,>(x: T | null): x is T => x !== null;

/** Published products in live shops. Everything below starts from this. */
function listing() {
  return supabase.from('products').select(LISTING).eq('status', 'published').eq('shops.status', 'live');
}

/** Escapes % and _ so a search for "50%" matches the text, not a wildcard. */
export const likePattern = (q: string) => `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// ------------------------------------------------------------------ Home

/** The sponsored slot: a product an admin has featured. Null when nothing is featured. */
export function useSponsoredLook() {
  return useQuery({
    queryKey: ['sponsored'],
    queryFn: async (): Promise<SponsoredLook | null> => {
      const { data, error } = await listing().eq('featured', true).order('created_at', { ascending: false }).limit(1).returns<Row[]>();
      if (error) throw error;
      const r = data?.[0];
      const card = r ? toStoreProduct(r) : null;
      if (!r || !card) return null;
      const who = r.gender === 'women' ? 'Female ' : r.gender === 'men' ? 'Male ' : '';
      return { ...card, dressType: `${who}${categoryLabel(r.category)}`, location: r.shops.city ? `${r.shops.city}, Nigeria` : 'Nigeria' };
    },
  });
}

/** "From stores near you": live shops in the shopper's city. Guests (no city) get every city. */
export function useNearbyProducts(city: string | null) {
  return useQuery({
    queryKey: ['nearby', city],
    queryFn: async (): Promise<ProductCardData[]> => {
      let q = listing();
      if (city) q = q.ilike('shops.city', city.trim());
      const { data, error } = await q.order('created_at', { ascending: false }).limit(12).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).map(toStoreProduct).filter(present);
    },
  });
}

/** "Explore": recent published products, each with up to four photos for the collage. */
export function useExploreProducts() {
  return useQuery({
    queryKey: ['explore'],
    queryFn: async (): Promise<ExploreTile[]> => {
      const { data, error } = await listing().order('created_at', { ascending: false }).limit(6).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).flatMap((r) => {
        const card = toStoreProduct(r);
        if (!card) return [];
        const images = sortedImages(r).slice(0, 4).map((i, n) => ({ source: { uri: i.url }, alt: i.alt || `${r.name}, photo ${n + 1}` }));
        const { image: _image, imageAlt: _alt, ...rest } = card;
        return [{ ...rest, images }];
      });
    },
  });
}

/** Search by product name (Home). Waits for two characters. */
export function useSearchProducts(text: string) {
  const q = text.trim();
  return useQuery({
    queryKey: ['search', q],
    enabled: q.length >= 2,
    queryFn: async (): Promise<StoreProduct[]> => {
      const { data, error } = await listing().ilike('name', likePattern(q)).order('created_at', { ascending: false }).limit(40).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).map(toStoreProduct).filter(present);
    },
  });
}

// ------------------------------------------------------------------ Brand store

export type ShopRow = import('@/lib/shop').Shop;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A shop by slug (or id). Null when there is no such shop, or it isn't live and isn't yours. */
export function useShop(slug: string) {
  return useQuery({
    queryKey: ['shop', slug],
    queryFn: async (): Promise<ShopRow | null> => {
      const { data, error } = await supabase.from('shops').select('*').eq(UUID.test(slug) ? 'id' : 'slug', slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** One shop's published products, filtered by category, gender and name on the server. */
export function useShopProducts(shop: Pick<ShopRow, 'id'> | null | undefined, f: { category: string; gender: GenderFilter; query: string }) {
  const q = f.query.trim();
  return useQuery({
    queryKey: ['shop-products', shop?.id, f.category, f.gender, q],
    enabled: !!shop,
    // Keep the old list on screen while a new filter loads, so the grid doesn't flash empty.
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<StoreProduct[]> => {
      let query = supabase.from('products').select(LISTING).eq('shop_id', shop!.id).eq('status', 'published');
      if (f.category !== 'all') query = query.eq('category', f.category);
      // A "both" product belongs to either gender.
      if (f.gender !== 'all') query = query.in('gender', [f.gender, 'both']);
      if (q) query = query.ilike('name', likePattern(q));
      const { data, error } = await query.order('created_at', { ascending: false }).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).map(toStoreProduct).filter(present);
    },
  });
}

// ------------------------------------------------------------------ Product detail

type DetailRow = ProductRow & {
  shops: { id: string; name: string; slug: string };
  product_images: Img[];
  product_variants: { id: string; size: Size; colour_name: string; colour_hex: string; stock: number }[];
};

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<ProductDetail | null> => {
      if (!UUID.test(id)) return null;
      const { data: p, error } = await supabase
        .from('products')
        .select('*, shops(id, name, slug), product_images(url, alt, position), product_variants(id, size, colour_name, colour_hex, stock)')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle<DetailRow>();
      if (error) throw error;
      if (!p || !p.shops) return null;
      const images = sortedImages(p);
      if (!images.length) return null;
      const colors: ProductDetail['colors'] = [];
      for (const v of p.product_variants) if (!colors.some((c) => c.name === v.colour_name)) colors.push({ name: v.colour_name, hex: v.colour_hex });
      return {
        id: p.id,
        vendorId: p.shops.slug,
        vendorName: p.shops.name,
        name: p.name,
        priceMinor: p.price_minor,
        currency: p.currency as Currency,
        image: { uri: images[0].url },
        imageAlt: images[0].alt || p.name,
        sizes: [...new Set(p.product_variants.filter((v) => v.stock > 0).map((v) => v.size))].sort(bySize),
        gallery: images.map((i, n) => ({ source: { uri: i.url }, alt: i.alt || `${p.name}, photo ${n + 1}` })),
        colors,
        allSizes: [...new Set(p.product_variants.map((v) => v.size))].sort(bySize),
        variants: p.product_variants.map((v) => ({ id: v.id, size: v.size, color: v.colour_name, stock: v.stock })),
        category: p.category,
        shopId: p.shops.id,
      };
    },
  });
}

/** Same category, other products. By default the same brand only; the switch adds other brands. */
export function useSimilarProducts(product: ProductDetail, otherBrands: boolean) {
  return useQuery({
    queryKey: ['similar', product.id, otherBrands],
    enabled: !!product.category,
    queryFn: async (): Promise<ProductCardData[]> => {
      let q = listing().eq('category', product.category!).neq('id', product.id);
      if (!otherBrands && product.shopId) q = q.eq('shop_id', product.shopId);
      const { data, error } = await q.order('created_at', { ascending: false }).limit(6).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).map(toStoreProduct).filter(present);
    },
  });
}

/**
 * Stand-in for RackGPT's matches (G3) until the vision model and pgvector search land in Week 2: the two newest
 * real products. The match percentage is a placeholder, not a score.
 */
export function useStandInMatches() {
  return useQuery({
    queryKey: ['rackgpt-standin'],
    queryFn: async (): Promise<OutfitMatch[]> => {
      const { data, error } = await listing().order('created_at', { ascending: false }).limit(2).returns<Row[]>();
      if (error) throw error;
      return (data ?? []).map(toStoreProduct).filter(present).map((p) => ({ ...p, matchPercent: 88 }));
    },
  });
}
