/**
 * Spec M9 steps. Wording is Figma 318:4429, except step 1: "Order Confirmed / Payment confirmed" became
 * "Reserved / Waiting for the vendor to confirm", because no payment is taken until Paystack (Week 3).
 * Each step is one fulfillment status (see FulfillmentTimeline): reserved, confirmed, shipped, delivered.
 */
export const ORDER_STEPS = [
  { status: 'confirmed', title: 'Reserved', body: 'Waiting for the vendor to confirm' },
  { status: 'processing', title: 'Processing', body: 'Order prepared for delivery' },
  { status: 'shipped', title: 'Shipped', body: 'Package picked up by rider' },
  { status: 'delivered', title: 'Delivered', body: 'Order received by you' },
] as const;
