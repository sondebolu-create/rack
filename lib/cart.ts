import { useMemo } from 'react';
import { create } from 'zustand';
import type { Currency } from '@/lib/format';
import type { ProductCardData, Size } from '@/lib/types';

/** Most of one variant a shopper can hold. */
export const MAX_QTY = 10;

/** One cart line is one variant: product + size + colour. */
export type CartItem = {
  /** `productId|size|colour`, so the same variant merges into one line. */
  id: string;
  product: ProductCardData;
  size: Size;
  /** Colour name, as on the product page. */
  color: string;
  qty: number;
};

export const cartItemId = (productId: string, size: Size, color: string) => `${productId}|${size}|${color}`;

/** Keeps only what the cart needs, so a ProductDetail passed in does not drag its gallery along. */
function snapshot(p: ProductCardData): ProductCardData {
  const { id, vendorId, vendorName, name, priceMinor, currency, image, imageAlt, sizes } = p;
  return { id, vendorId, vendorName, name, priceMinor, currency, image, imageAlt, sizes };
}

type CartState = {
  items: CartItem[];
  /** Adds `qty` of a variant, merging into an existing line and capping at MAX_QTY. */
  add: (product: ProductCardData, size: Size, color: string, qty?: number) => void;
  /** Sets a line's quantity. Zero or less removes it. */
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  /** Removes every variant of one product. */
  removeProduct: (productId: string) => void;
  clear: () => void;
};

/**
 * The shopper's cart (M6). Shared by Product Detail, the try-on result, RackGPT and Checkout.
 * In memory only for now; it resets when the app restarts.
 */
export const useCartStore = create<CartState>((set) => ({
  items: [],

  add: (product, size, color, qty = 1) =>
    set((s) => {
      const id = cartItemId(product.id, size, color);
      const existing = s.items.find((i) => i.id === id);
      if (existing) {
        return { items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)) };
      }
      return { items: [...s.items, { id, product: snapshot(product), size, color, qty: Math.min(MAX_QTY, qty) }] };
    }),

  setQty: (id, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((i) => i.id !== id)
          : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
    })),

  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  removeProduct: (productId) => set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
  clear: () => set({ items: [] }),
}));

export type CartTotals = {
  /** Units across all lines. */
  count: number;
  /** Integer minor units. Shipping and tax are worked out at checkout, so they are not in here. */
  subtotalMinor: number;
  /** The cart is single-currency (NGN) until the catalogue says otherwise. */
  currency: Currency;
};

export function cartTotals(items: CartItem[]): CartTotals {
  return {
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotalMinor: items.reduce((sum, i) => sum + i.product.priceMinor * i.qty, 0),
    currency: items[0]?.product.currency ?? 'NGN',
  };
}

export function useCartTotals(): CartTotals {
  const items = useCartStore((s) => s.items);
  return useMemo(() => cartTotals(items), [items]);
}

/** Units in the cart. A number, so it only re-renders when the count changes. */
export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
}

export function useCartItem(id: string | null): CartItem | undefined {
  return useCartStore((s) => (id ? s.items.find((i) => i.id === id) : undefined));
}
