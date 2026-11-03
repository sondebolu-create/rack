// TEMPORARY fixtures for the RackGPT flow (G1-G4).
// The vision model and pgvector matching land in Week 2. Until then, every request returns these two matches.
// Photos are reused from the Home fixtures.
import { mockImages } from '@/lib/mock/home';
import type { OutfitMatch } from '@/lib/types';

/** The four processing stages, in Figma's wording. */
export const PROCESSING_STEPS = [
  'Analyzing image...',
  'Detecting clothing items...',
  'Matching with available products...',
  'Finding best deals...',
] as const;

export const rackgptMatches: OutfitMatch[] = [
  {
    id: 'p-casual-summer-dress-1',
    vendorId: 'v-urban-threads',
    vendorName: 'Urban Threads',
    name: 'Casual Summer Dress',
    priceMinor: 3_599_900, // ₦35,999.00 in kobo
    currency: 'NGN',
    image: mockImages.explore3,
    imageAlt: 'Woman in a green lace mini dress with her arms raised',
    sizes: ['XS', 'S', 'M', 'L'],
    matchPercent: 88,
  },
  {
    id: 'p-casual-summer-dress-2',
    vendorId: 'v-urban-threads',
    vendorName: 'Urban Threads',
    name: 'Casual Summer Dress',
    priceMinor: 7_199_900, // ₦71,999.00 in kobo
    currency: 'NGN',
    image: mockImages.explore4,
    imageAlt: 'Woman in a green off-shoulder sequin dress',
    sizes: ['S', 'M', 'L'],
    matchPercent: 88,
  },
];
