import { create } from 'zustand';
import type { CardSummary } from '@/lib/card';
import type { CartItem } from '@/lib/cart';
import { cartTotals } from '@/lib/cart';
import type { Currency } from '@/lib/format';
import type { Address, DeliveryMethod, PaymentMethod } from '@/lib/checkout';

/** Spec M9: Confirmed, Processing, Shipped, Delivered. Copy from Figma 318:4429. */
export const ORDER_STEPS = [
  { status: 'confirmed', title: 'Order Confirmed', body: 'Payment confirmed' },
  { status: 'processing', title: 'Processing', body: 'Order prepared for delivery' },
  { status: 'shipped', title: 'Shipped', body: 'Package picked up by rider' },
  { status: 'delivered', title: 'Delivered', body: 'Order received by you' },
] as const;

export type OrderStatus = (typeof ORDER_STEPS)[number]['status'];

export type Order = {
  /** The five-digit order number, shown as "#12345". Also the route id. */
  id: string;
  createdAt: number;
  items: CartItem[];
  /** Integer minor units. */
  subtotalMinor: number;
  /** What was paid. Same as the subtotal until delivery fees are decided (spec open question). */
  totalMinor: number;
  currency: Currency;
  delivery: DeliveryMethod;
  address: Address | null;
  payment: PaymentMethod;
  card: CardSummary | null;
  status: OrderStatus;
  /** When each step was reached. */
  history: Partial<Record<OrderStatus, number>>;
  estimatedDeliveryAt: number;
  addressFlagged: boolean;
};

export type NewOrder = {
  items: CartItem[];
  delivery: DeliveryMethod;
  address: Address | null;
  payment: PaymentMethod;
  card: CardSummary | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

type OrdersState = {
  /** Newest first. */
  orders: Order[];
  /** Mock payment: this just records the order locally. Paystack replaces it in Week 3. */
  place: (input: NewOrder) => Order;
  /** Moves an order to its next step. For the dev button until vendor order status (V3) exists. */
  advance: (id: string) => void;
  flagAddress: (id: string) => void;
};

function newOrderId(taken: Set<string>): string {
  let id: string;
  do id = String(10000 + Math.floor(Math.random() * 90000));
  while (taken.has(id));
  return id;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],

  place: (input) => {
    const now = Date.now();
    const totals = cartTotals(input.items);
    const order: Order = {
      id: newOrderId(new Set(get().orders.map((o) => o.id))),
      createdAt: now,
      items: input.items,
      subtotalMinor: totals.subtotalMinor,
      totalMinor: totals.subtotalMinor,
      currency: totals.currency,
      delivery: input.delivery,
      address: input.address,
      payment: input.payment,
      card: input.card,
      status: 'confirmed',
      history: { confirmed: now },
      estimatedDeliveryAt: now + (input.delivery === 'delivery' ? 3 : 1) * DAY_MS,
      addressFlagged: false,
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  advance: (id) =>
    set((s) => ({
      orders: s.orders.map((o) => {
        const next = ORDER_STEPS[ORDER_STEPS.findIndex((st) => st.status === o.status) + 1];
        return o.id === id && next ? { ...o, status: next.status, history: { ...o.history, [next.status]: Date.now() } } : o;
      }),
    })),

  flagAddress: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, addressFlagged: true } : o)) })),
}));

export function useOrder(id: string | undefined): Order | undefined {
  return useOrdersStore((s) => s.orders.find((o) => o.id === id));
}
