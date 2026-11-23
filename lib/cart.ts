import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { formatPrice, type Currency } from '@/lib/format';
import type { LineCheck } from '@/lib/queries/cart';
import { appStorage } from '@/lib/storage';
import type { ProductCardData, Size } from '@/lib/types';

/** Most of one variant a shopper can hold. */
export const MAX_QTY = 10;

/** One cart line is one variant: product + size + colour. Its `id` IS the variant id, which is what place_order takes. */
export type CartItem = {
  /** product_variants.id. The same variant merges into one line. */
  id: string;
  product: ProductCardData;
  size: Size;
  /** Colour name, as on the product page. */
  color: string;
  qty: number;
  /** Units in stock the last time we looked. Caps the quantity. */
  stock?: number;
  /** Something the shopper should know about this line (price moved, quantity reduced). Cleared when they dismiss it. */
  notice?: string;
};

/** Most of one line the shopper can hold: the global cap, or what is in stock if that is lower. */
export const maxQtyFor = (i: Pick<CartItem, 'stock'>) => Math.min(MAX_QTY, i.stock ?? MAX_QTY);

/** Keeps only what the cart needs, so a product page's gallery doesn't get saved with it. */
function snapshot(p: ProductCardData): ProductCardData {
  const { id, vendorId, vendorName, name, priceMinor, currency, image, imageAlt, sizes } = p;
  return { id, vendorId, vendorName, name, priceMinor, currency, image, imageAlt, sizes };
}

type CartState = {
  items: CartItem[];
  /** Adds `qty` of a variant, merging into an existing line and capping at MAX_QTY or the stock. */
  add: (product: ProductCardData, variantId: string, size: Size, color: string, qty?: number, stock?: number) => void;
  /** Sets a line's quantity. Zero or less removes it. */
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  /** Removes every variant of one product. */
  removeProduct: (productId: string) => void;
  clear: () => void;
  dismissNotice: (id: string) => void;
  /** Applies a fresh price and stock check: updates prices and stock, trims quantities, and leaves a notice on what changed. */
  reconcile: (checks: Record<string, LineCheck>) => void;
};

/**
 * The shopper's cart (M6). Shared by Product Detail, the try-on result, RackGPT and Checkout.
 * Saved to AsyncStorage (localStorage on web), so it survives a restart or a browser refresh, for guests too.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, variantId, size, color, qty = 1, stock) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === variantId);
          const cap = maxQtyFor({ stock: stock ?? existing?.stock });
          if (cap <= 0) return s; // sold out: nothing to add
          if (existing) {
            return { items: s.items.map((i) => (i.id === variantId ? { ...i, stock: stock ?? i.stock, qty: Math.min(cap, i.qty + qty) } : i)) };
          }
          return { items: [...s.items, { id: variantId, product: snapshot(product), size, color, qty: Math.min(cap, qty), stock }] };
        }),

      setQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(maxQtyFor(i), qty) } : i)),
        })),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      removeProduct: (productId) => set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      clear: () => set({ items: [] }),
      dismissNotice: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, notice: undefined } : i)) })),

      reconcile: (checks) =>
        set((s) => ({
          items: s.items.map((i) => {
            const c = checks[i.id];
            if (!c || c.state === 'unavailable') return i;
            const stock = c.stock;
            let next: CartItem = { ...i, stock };
            const notes: string[] = [];
            if (c.state === 'price_changed') {
              notes.push(`Price changed from ${formatPrice(i.product.priceMinor, i.product.currency)} to ${formatPrice(c.priceMinor, i.product.currency)}.`);
              next = { ...next, product: { ...i.product, priceMinor: c.priceMinor } };
            }
            if (stock > 0 && i.qty > stock) {
              notes.push(`Only ${stock} left, so the quantity was reduced.`);
              next = { ...next, qty: stock };
            }
            // Keep an earlier notice the shopper hasn't dismissed yet.
            if (notes.length) next = { ...next, notice: notes.join(' ') };
            return next;
          }),
        })),
    }),
    {
      name: 'rack-cart',
      version: 2,
      storage: createJSONStorage(() => appStorage),
      partialize: (s) => ({ items: s.items }),
      // v1 carts (in memory only) never reached storage, and carts without variant ids can't be ordered: start clean.
      migrate: () => ({ items: [] }),
    },
  ),
);

export type CartTotals = {
  /** Units across all lines. */
  count: number;
  /** Integer minor units. Shipping and tax are worked out at checkout, so they are not in here. */
  subtotalMinor: number;
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
