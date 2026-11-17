import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Currency } from '@/lib/format';
import type { CartItem } from '@/lib/cart';
import { queryClient } from '@/lib/queries/client';

export type Delivery = { name: string; phone: string; address: string; city: string };

export type PlaceOrderError =
  | { kind: 'out_of_stock'; variantId: string | null; message: string }
  | { kind: 'unavailable'; variantId: string | null; message: string }
  | { kind: 'other'; message: string };

const UUID_IN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * place_order() locks the variants, checks stock and writes the order in one transaction, so it either places the
 * whole order or nothing. Its errors carry a code and (for stock) the variant id, so the screen can say which line failed.
 */
export async function placeOrder(items: CartItem[], delivery: Delivery): Promise<{ id: string } | { error: PlaceOrderError }> {
  const { data, error } = await supabase.rpc('place_order', {
    items: items.map((i) => ({ variant_id: i.id, quantity: i.qty })),
    delivery,
  });
  if (!error && data) return { id: data };
  const msg = error?.message ?? '';
  const variantId = (error?.details ?? msg).match(UUID_IN)?.[0] ?? null;
  if (msg.startsWith('OUT_OF_STOCK')) return { error: { kind: 'out_of_stock', variantId, message: msg.replace(/^OUT_OF_STOCK:\s*/, '') } };
  if (msg.startsWith('UNAVAILABLE')) return { error: { kind: 'unavailable', variantId, message: 'This item is no longer for sale.' } };
  if (msg.startsWith('INVALID_DELIVERY')) return { error: { kind: 'other', message: 'Add your name, phone number and address.' } };
  return { error: { kind: 'other', message: 'Could not place your order. Check your connection and try again.' } };
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: ({ items, delivery }: { items: CartItem[]; delivery: Delivery }) => placeOrder(items, delivery),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      // Stock changed under every product page and list.
      void queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export type PlacedOrder = {
  id: string;
  order_number: number;
  created_at: string;
  total_minor: number;
  currency: Currency;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  items: { id: string; product_name: string; size: string; colour_name: string; quantity: number; unit_price_minor: number; photo: string | null }[];
};

type RawOrder = Omit<PlacedOrder, 'items'> & {
  order_items: (Omit<PlacedOrder['items'][number], 'photo'> & {
    product_variants: { products: { product_images: { url: string; position: number }[] } | null } | null;
  })[];
};

/** One of the signed-in shopper's own orders, with its items. */
export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<PlacedOrder | null> => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, order_number, created_at, total_minor, currency, delivery_name, delivery_phone, delivery_address, delivery_city, order_items(id, product_name, size, colour_name, quantity, unit_price_minor, product_variants(products(product_images(url, position))))',
        )
        .eq('id', id)
        .maybeSingle<RawOrder>();
      if (error) throw error;
      if (!data) return null;
      const { order_items, ...o } = data;
      return {
        ...o,
        items: order_items.map(({ product_variants, ...i }) => ({
          ...i,
          photo: [...(product_variants?.products?.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null,
        })),
      };
    },
  });
}

export type MyOrder = {
  id: string;
  order_number: number;
  created_at: string;
  total_minor: number;
  currency: Currency;
  order_fulfillments: { status: string }[];
};

export function useMyOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async (): Promise<MyOrder[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total_minor, currency, order_fulfillments(status)')
        .order('created_at', { ascending: false })
        .limit(50)
        .returns<MyOrder[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** One real order with a timeline per shop (Track Order). */
export function useTrackedOrder(id: string) {
  return useQuery({ queryKey: ['tracked', id], queryFn: () => import('@/lib/fulfillments').then((m) => m.fetchTrackedOrder(id)), refetchInterval: 30_000 });
}
