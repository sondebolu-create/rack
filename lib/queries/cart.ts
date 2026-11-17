import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CartItem } from '@/lib/cart';

/** What the database says about one cart line right now. */
export type LineCheck =
  | { state: 'ok'; stock: number; priceMinor: number }
  | { state: 'price_changed'; stock: number; priceMinor: number; was: number }
  | { state: 'sold_out'; stock: 0; priceMinor: number }
  | { state: 'unavailable' };

type Row = {
  id: string;
  stock: number;
  products: { price_minor: number; status: string; shops: { status: string } | null } | null;
};

/**
 * Re-checks every cart line's price and stock. Runs when the cart opens (and again on refocus), so a price that
 * moved or a variant that sold out since it was added is flagged before checkout. A line the shopper can no
 * longer see (unpublished product, shop offline, variant deleted) comes back as `unavailable`.
 */
export function useCartCheck(items: CartItem[]) {
  const ids = items.map((i) => i.id).sort();
  return useQuery({
    queryKey: ['cart-check', ids, items.map((i) => i.product.priceMinor).join(',')],
    enabled: ids.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async (): Promise<Record<string, LineCheck>> => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, stock, products(price_minor, status, shops(status))')
        .in('id', ids)
        .returns<Row[]>();
      if (error) throw error;
      const byId = new Map((data ?? []).map((r) => [r.id, r]));
      const out: Record<string, LineCheck> = {};
      for (const item of items) {
        const r = byId.get(item.id);
        if (!r || !r.products || r.products.status !== 'published' || r.products.shops?.status !== 'live') {
          out[item.id] = { state: 'unavailable' };
        } else if (r.stock <= 0) {
          out[item.id] = { state: 'sold_out', stock: 0, priceMinor: r.products.price_minor };
        } else if (r.products.price_minor !== item.product.priceMinor) {
          out[item.id] = { state: 'price_changed', stock: r.stock, priceMinor: r.products.price_minor, was: item.product.priceMinor };
        } else {
          out[item.id] = { state: 'ok', stock: r.stock, priceMinor: r.products.price_minor };
        }
      }
      return out;
    },
  });
}
