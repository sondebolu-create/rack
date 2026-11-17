import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Currency } from '@/lib/format';
import type { Size } from '@/lib/types';

export type FulfillmentStatus = Database['public']['Enums']['fulfillment_status'];
type FulfillmentRow = Database['public']['Tables']['order_fulfillments']['Row'];

/** Moves a vendor can make from each status. Mirrors the database rule, which is the real check. */
export const NEXT_STATUS: Partial<Record<FulfillmentStatus, FulfillmentStatus>> = {
  reserved: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};
export const canCancel = (s: FulfillmentStatus) => s === 'reserved' || s === 'confirmed';

export const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  reserved: 'New',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
/** The button that moves a fulfillment forward, by the status it is in now. */
export const ACTION_LABEL: Partial<Record<FulfillmentStatus, string>> = {
  reserved: 'Confirm order',
  confirmed: 'Mark as shipped',
  shipped: 'Mark as delivered',
};

/** When each status was reached, as ms. `history` is JSON written by a database trigger. */
export function historyMs(f: Pick<FulfillmentRow, 'history' | 'status' | 'updated_at'>): Partial<Record<FulfillmentStatus, number>> {
  const out: Partial<Record<FulfillmentStatus, number>> = {};
  const h = (f.history ?? {}) as Record<string, string>;
  for (const [k, v] of Object.entries(h)) {
    const t = Date.parse(v);
    if (!Number.isNaN(t)) out[k as FulfillmentStatus] = t;
  }
  return out;
}

// ------------------------------------------------------------------ vendor side

export type OrderInfo = {
  order_number: number;
  created_at: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  currency: Currency;
  status: Database['public']['Enums']['order_status'];
};
export type VendorFulfillment = FulfillmentRow & { orders: OrderInfo | null };
export type VendorListItem = VendorFulfillment & { itemCount: number; totalMinor: number };

const ORDER_COLS = 'order_number, created_at, delivery_name, delivery_phone, delivery_address, delivery_city, currency, status';

export const firstName = (full: string) => full.trim().split(/\s+/)[0] || 'Shopper';

/** This shop's fulfillments, newest order first, each with this shop's item count and total. RLS limits rows to this vendor. */
export async function listFulfillments(): Promise<{ data?: VendorListItem[]; error?: true }> {
  const { data, error } = await supabase
    .from('order_fulfillments')
    .select(`*, orders(${ORDER_COLS})`)
    .order('updated_at', { ascending: false })
    .limit(300)
    .returns<VendorFulfillment[]>();
  if (error || !data) return { error: true };
  const ids = data.map((f) => f.order_id);
  const items = ids.length
    ? await supabase.from('order_items').select('order_id, shop_id, quantity, unit_price_minor').in('order_id', ids)
    : { data: [], error: null };
  if (items.error) return { error: true };
  const list = data
    .map((f) => {
      const mine = (items.data ?? []).filter((i) => i.order_id === f.order_id && i.shop_id === f.shop_id);
      return {
        ...f,
        itemCount: mine.reduce((n, i) => n + i.quantity, 0),
        totalMinor: mine.reduce((n, i) => n + i.quantity * i.unit_price_minor, 0),
      };
    })
    .sort((a, b) => Date.parse(b.orders?.created_at ?? '') - Date.parse(a.orders?.created_at ?? ''));
  return { data: list };
}

export type FulfillmentItem = {
  id: string;
  quantity: number;
  unit_price_minor: number;
  product_name: string;
  size: Size;
  colour_name: string;
  photo: string | null;
};

type RawItem = Omit<FulfillmentItem, 'photo'> & {
  product_variants: { products: { product_images: { url: string; position: number }[] } | null } | null;
};

export async function loadFulfillment(id: string): Promise<{ fulfillment: VendorFulfillment; items: FulfillmentItem[] } | null> {
  const { data: f } = await supabase.from('order_fulfillments').select(`*, orders(${ORDER_COLS})`).eq('id', id).maybeSingle<VendorFulfillment>();
  if (!f) return null;
  const { data } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price_minor, product_name, size, colour_name, product_variants(products(product_images(url, position)))')
    .eq('order_id', f.order_id)
    .eq('shop_id', f.shop_id)
    .returns<RawItem[]>();
  const items = (data ?? []).map(({ product_variants, ...i }) => ({
    ...i,
    photo: [...(product_variants?.products?.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null,
  }));
  return { fulfillment: f, items };
}

const ERRORS: [string, string][] = [
  ['CANCEL_REASON_REQUIRED', 'Say why you are cancelling.'],
  ['INVALID_TRANSITION', 'This order has already moved on. Refresh and try again.'],
  ['cannot be cancelled', 'A shipped order cannot be cancelled.'],
];
const failure = (message: string) => ERRORS.find(([c]) => message.includes(c))?.[1] ?? 'Could not update the order. Try again.';

/** Moves forward one step. `from` is sent too, so a stale screen can't push an order that has already changed. */
export async function advanceFulfillment(id: string, from: FulfillmentStatus): Promise<{ error?: string }> {
  const to = NEXT_STATUS[from];
  if (!to) return { error: 'This order cannot move forward.' };
  const { data, error } = await supabase.from('order_fulfillments').update({ status: to }).eq('id', id).eq('status', from).select('id');
  if (error) return { error: failure(error.message) };
  if (!data?.length) return { error: 'This order has already moved on. Refresh and try again.' };
  return {};
}

/** Cancels with a reason. The database puts this shop's stock back. */
export async function cancelFulfillment(id: string, reason: string): Promise<{ error?: string }> {
  const r = reason.trim();
  if (!r) return { error: 'Say why you are cancelling.' };
  const { error } = await supabase.from('order_fulfillments').update({ status: 'cancelled', cancel_reason: r }).eq('id', id);
  return error ? { error: failure(error.message) } : {};
}

/** Count of new (reserved) orders, for the badge. Reloads when `tick` changes. */
export function useNewOrderCount(enabled: boolean, tick: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    void supabase
      .from('order_fulfillments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'reserved')
      .then(({ count: c }) => live && setCount(c ?? 0));
    return () => {
      live = false;
    };
  }, [enabled, tick]);
  return count;
}

// ------------------------------------------------------------------ dashboard

export type LowStock = { id: string; size: Size; colour_name: string; stock: number; products: { id: string; name: string; status: string } };

export async function loadDashboard(shopId: string) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: 'exact', head: true } as const;
  const [reserved, confirmed, delivered, low, anyProduct, published] = await Promise.all([
    count(supabase.from('order_fulfillments').select('id', head).eq('status', 'reserved')),
    count(supabase.from('order_fulfillments').select('id', head).eq('status', 'confirmed')),
    count(supabase.from('order_fulfillments').select('id', head).eq('status', 'delivered').gte('updated_at', weekAgo)),
    supabase
      .from('product_variants')
      .select('id, size, colour_name, stock, products!inner(id, name, status, shop_id)')
      .lte('stock', 3)
      .eq('products.shop_id', shopId)
      .neq('products.status', 'archived')
      .order('stock')
      .limit(20)
      .returns<LowStock[]>(),
    count(supabase.from('products').select('id', head).eq('shop_id', shopId)),
    count(supabase.from('products').select('id', head).eq('shop_id', shopId).eq('status', 'published')),
  ]);
  return { reserved, confirmed, delivered, lowStock: low.data ?? [], anyProduct, published };
}

// ------------------------------------------------------------------ shopper side

export type TrackedShop = FulfillmentRow & { shops: { name: string } | null; items: { name: string; qty: number }[] };
export type TrackedOrder = { order_number: number; created_at: string; fulfillments: TrackedShop[] };

/** One real order with a fulfillment (and so a timeline) per shop. RLS lets a shopper read only their own. */
export async function fetchTrackedOrder(orderId: string): Promise<TrackedOrder | null> {
  const { data: o } = await supabase
    .from('orders')
    .select('order_number, created_at, order_fulfillments(*, shops(name))')
    .eq('id', orderId)
    .maybeSingle<{ order_number: number; created_at: string; order_fulfillments: (FulfillmentRow & { shops: { name: string } | null })[] }>();
  if (!o) return null;
  const { data: items } = await supabase.from('order_items').select('shop_id, product_name, quantity').eq('order_id', orderId);
  return {
    order_number: o.order_number,
    created_at: o.created_at,
    fulfillments: o.order_fulfillments
      .map((f) => ({
        ...f,
        items: (items ?? []).filter((i) => i.shop_id === f.shop_id).map((i) => ({ name: i.product_name, qty: i.quantity })),
      }))
      .sort((a, b) => (a.shops?.name ?? '').localeCompare(b.shops?.name ?? '')),
  };
}

export function useReload() {
  const [n, setN] = useState(0);
  return [n, useCallback(() => setN((x) => x + 1), [])] as const;
}
