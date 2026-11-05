// TEMPORARY fixtures for the brand store (M3). Replace with a Supabase read once the catalogue has
// categories and a gender column. Built from the existing mock catalogue, so no products are invented.
import type { IconName } from '@/components/ui/Icon';
import { CATALOGUE } from '@/lib/mock/product';
import type { ProductCardData } from '@/lib/types';

export type Gender = 'women' | 'men';
export type GenderFilter = 'all' | Gender;

export type StoreCategory = { id: string; label: string; icon: IconName };

/** Tab order and wording from Figma 318:3846. `all` is the unfiltered tab. Tabs render from this list. */
export const STORE_CATEGORIES: StoreCategory[] = [
  { id: 'all', label: 'All', icon: 'catAll' },
  { id: 'shoes', label: 'Shoes', icon: 'catShoes' },
  { id: 'gowns', label: 'Gowns', icon: 'catGowns' },
  { id: 'jewelries', label: 'Jewelries', icon: 'catJewelry' },
  { id: 'corporate', label: 'Corporate', icon: 'catCorporate' },
];

export type StoreProduct = ProductCardData & { category: string; gender: Gender };

/** Category and gender for each existing mock product. Shoes and Jewelries have no photos yet, so they stay empty. */
const TAGS: Record<string, { category: string; gender: Gender }> = {
  'p-gown': { category: 'gowns', gender: 'women' },
  'p-elegant-gown': { category: 'gowns', gender: 'women' },
  'p-casual-summer-dress-1': { category: 'gowns', gender: 'women' },
  'p-casual-summer-dress-2': { category: 'gowns', gender: 'women' },
  'p-drews-shirt': { category: 'corporate', gender: 'men' },
  'p-rich-man-buba': { category: 'corporate', gender: 'men' },
};

/** The brand's name, from any of its products. Undefined for an unknown vendor id. */
export function getVendorName(vendorId: string | undefined): string | undefined {
  return CATALOGUE.find((p) => p.vendorId === vendorId)?.vendorName;
}

/** One brand's products with their category and gender. The sponsored gown and the Home card are the same item, so each shows once. */
export function getStoreFeed(vendorId: string | undefined): StoreProduct[] {
  const seen = new Set<string>();
  const feed: StoreProduct[] = [];
  for (const p of CATALOGUE) {
    const tag = TAGS[p.id];
    const key = `${p.vendorId}|${p.name}|${p.imageAlt}`;
    if (p.vendorId !== vendorId || !tag || seen.has(key)) continue;
    seen.add(key);
    feed.push({ ...p, ...tag });
  }
  return feed;
}
