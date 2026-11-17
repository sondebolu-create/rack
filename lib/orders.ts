/** Spec M9: Confirmed, Processing, Shipped, Delivered. Copy from Figma 318:4429. Each is one fulfillment status (see FulfillmentTimeline). */
export const ORDER_STEPS = [
  { status: 'confirmed', title: 'Order Confirmed', body: 'Payment confirmed' },
  { status: 'processing', title: 'Processing', body: 'Order prepared for delivery' },
  { status: 'shipped', title: 'Shipped', body: 'Package picked up by rider' },
  { status: 'delivered', title: 'Delivered', body: 'Order received by you' },
] as const;
