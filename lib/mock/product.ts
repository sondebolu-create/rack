// TEMPORARY fixtures for the product page (M4). Built from the Home and RackGPT mock products.
// Replace with a Supabase read once the catalogue schema and seed exist.
import { nearbyProducts, sponsoredLook } from '@/lib/mock/home';
import { rackgptMatches } from '@/lib/mock/rackgpt';
import type { ProductCardData, ProductColor, ProductDetail } from '@/lib/types';

/** Colour options in Figma 318:4068. Every mock product offers the same four. */
const COLORS: ProductColor[] = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
  { name: 'Green', hex: '#00a63e' },
  { name: 'Red', hex: '#c10007' },
];

export const CATALOGUE: ProductCardData[] = [sponsoredLook, ...nearbyProducts, ...rackgptMatches];

export function getProduct(id: string | undefined): ProductDetail | undefined {
  const base = CATALOGUE.find((p) => p.id === id);
  if (!base) return undefined;
  // Figma shows the same photo three times: one large, two small.
  const gallery = [base.imageAlt, `${base.imageAlt}, second view`, `${base.imageAlt}, third view`].map((alt) => ({
    source: base.image,
    alt,
  }));
  return { ...base, gallery, colors: COLORS };
}

/** Other products to suggest. Same vendor only, unless `includeOtherBrands`. */
export function getSimilarProducts(product: ProductDetail, includeOtherBrands: boolean): ProductCardData[] {
  const seen = new Set<string>();
  return CATALOGUE.filter((p) => {
    // The sponsored look and the matching Home card are the same item, so de-duplicate by vendor + name + photo.
    const key = `${p.vendorId}|${p.name}|${p.imageAlt}`;
    if (p.id === product.id || key === `${product.vendorId}|${product.name}|${product.imageAlt}` || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return includeOtherBrands || p.vendorId === product.vendorId;
  });
}
