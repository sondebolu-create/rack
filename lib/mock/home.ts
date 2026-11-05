// TEMPORARY fixtures for the Home screen (M2).
// Replace with TanStack Query reads from Supabase once the catalogue schema and seed exist.
// Photos are bundled placeholders from Figma, not Storage URLs.
import type { ExploreTile, ProductCardData, SponsoredLook } from '@/lib/types';

const gown = require('@/assets/images/mock/look-gown.jpg');
const shirtWhite = require('@/assets/images/mock/shirt-white.png');
const shirtGreen = require('@/assets/images/mock/shirt-green.png');
const explore1 = require('@/assets/images/mock/explore-1.png');
const explore2 = require('@/assets/images/mock/explore-2.png');
const explore3 = require('@/assets/images/mock/explore-3.png');
const explore4 = require('@/assets/images/mock/explore-4.png');

export const mockImages = { gown, shirtWhite, shirtGreen, explore1, explore2, explore3, explore4 };

const PRICE = 5_799_900; // ₦57,999.00 in kobo

export const sponsoredLook: SponsoredLook = {
  id: 'p-gown',
  vendorId: 'v-fashion-nova',
  vendorName: 'Adire House',
  name: 'Elegant Gown',
  priceMinor: PRICE,
  currency: 'NGN',
  image: gown,
  imageAlt: 'Woman in a peach tiered ruffle gown',
  sizes: ['S', 'M', 'L'],
  dressType: 'Female Gown',
  location: 'Lagos, Nigeria',
};

export const nearbyProducts: ProductCardData[] = [
  {
    id: 'p-drews-shirt',
    vendorId: 'v-fashion-nova',
    vendorName: 'Adire House',
    name: 'Drew’s Shirt',
    priceMinor: PRICE,
    currency: 'NGN',
    image: shirtWhite,
    imageAlt: 'Man wearing a white patterned short-sleeve shirt',
    sizes: ['M', 'L'],
  },
  {
    id: 'p-rich-man-buba',
    vendorId: 'v-micah',
    vendorName: 'Micah',
    name: 'Rich Man Buba',
    priceMinor: PRICE,
    currency: 'NGN',
    image: shirtGreen,
    imageAlt: 'Man wearing a green and cream patterned buba',
    sizes: ['M'],
  },
  {
    id: 'p-elegant-gown',
    vendorId: 'v-fashion-nova',
    vendorName: 'Adire House',
    name: 'Elegant Gown',
    priceMinor: PRICE,
    currency: 'NGN',
    image: gown,
    imageAlt: 'Woman in a peach tiered ruffle gown',
    sizes: ['S', 'M', 'L'],
  },
];

export const exploreTiles: ExploreTile[] = [
  {
    id: 'e-1',
    vendorId: 'v-fashion-nova',
    vendorName: 'Adire House',
    name: 'Elegant Gown',
    priceMinor: PRICE,
    currency: 'NGN',
    sizes: ['M'],
    images: [
      { source: explore1, alt: 'Woman in a green print dress holding a white bag' },
      { source: explore2, alt: 'Woman posing in a green print dress' },
      { source: explore3, alt: 'Close-up of a green print dress' },
      { source: explore4, alt: 'Detail of a green print dress' },
    ],
  },
  {
    id: 'e-2',
    vendorId: 'v-fashion-nova',
    vendorName: 'Adire House',
    name: 'Elegant Gown',
    priceMinor: PRICE,
    currency: 'NGN',
    sizes: ['M'],
    images: [
      { source: gown, alt: 'Woman in a peach tiered ruffle gown' },
      { source: explore1, alt: 'Woman in a green print dress holding a white bag' },
      { source: explore3, alt: 'Close-up of a green print dress' },
      { source: explore4, alt: 'Detail of a green print dress' },
    ],
  },
];
