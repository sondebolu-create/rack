import type { IconName } from '@/components/ui/Icon';
import type { ProductCardData } from '@/lib/types';

export type Gender = 'women' | 'men';
export type GenderFilter = 'all' | Gender;

export type StoreCategory = { id: string; label: string; icon: IconName };

/** Tab order and wording from Figma 318:3846. `all` is the unfiltered tab. A shop's tabs are the ones it sells (see categoriesFor). */
export const STORE_CATEGORIES: StoreCategory[] = [
  { id: 'all', label: 'All', icon: 'catAll' },
  { id: 'shoes', label: 'Shoes', icon: 'catShoes' },
  { id: 'gowns', label: 'Gowns', icon: 'catGowns' },
  { id: 'jewelries', label: 'Jewelries', icon: 'catJewelry' },
  { id: 'corporate', label: 'Corporate', icon: 'catCorporate' },
];

/** The categories a vendor can pick (everything except the "All" tab). Stored by id, shown by label. */
export const SELLABLE_CATEGORIES = STORE_CATEGORIES.filter((c) => c.id !== 'all');
export const categoryLabel = (id: string) => SELLABLE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** A product on a store page: the card data plus what the tabs and the gender toggle filter on. `both` shows under either gender. */
export type StoreProduct = ProductCardData & { category: string; gender: Gender | 'both' };
