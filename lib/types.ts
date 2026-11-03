import type { ImageProps } from 'expo-image';
import type { Currency } from '@/lib/format';

/** What expo-image accepts: a require()d asset, a URL string or a {uri} object. */
export type ImageSource = NonNullable<ImageProps['source']>;

/** Matches the DB enum. Stock is tracked per product + size + colour. */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = (typeof SIZES)[number];

/** What a product card needs. Price is an integer in minor units (kobo for NGN). */
export type ProductCardData = {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  priceMinor: number;
  currency: Currency;
  image: ImageSource;
  imageAlt: string;
  /** Sizes currently in stock. */
  sizes: Size[];
};

/** A colour option on the product page. `hex` is product data (what the item looks like), not a UI token. */
export type ProductColor = { name: string; hex: string };

/** Everything the product page needs. */
export type ProductDetail = ProductCardData & {
  gallery: { source: ImageSource; alt: string }[];
  colors: ProductColor[];
};

/** The sponsored slot at the top of Home. */
export type SponsoredLook = ProductCardData & {
  dressType: string;
  location: string;
};

/** A vendor's collage tile in "Explore". Up to four photos. */
export type ExploreTile = Omit<ProductCardData, 'image' | 'imageAlt'> & {
  images: { source: ImageSource; alt: string }[];
};

/** A RackGPT result: a product plus how closely it matched the request (0-100). */
export type OutfitMatch = ProductCardData & { matchPercent: number };
