// End-to-end check of a two-shop order against a real Supabase project, using only the anon key and real
// sign-ins (so row-level security is exercised exactly as in the app):
//   1. the shopper places ONE order with items from TWO shops, through place_order()
//   2. each vendor signs in, sees only their own part, and moves it confirmed -> shipped
//   3. the shopper reads the order back: one fulfillment per shop, each with its own status
//
//   TEST_SHOPPER=a@x.com:pw VENDOR_A=b@x.com:pw VENDOR_B=c@x.com:pw \
//     node --env-file=.env scripts/verify-multishop-order.mjs --yes
//
// It WRITES a real order and takes stock from two variants of the project in .env. Use a test project, or accept
// that you will see a test order. Vendor A and B must own two different live shops that each have a published,
// in-stock product. Passwords come from your shell only; never put them in .env or git.

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const creds = (name) => {
  const v = process.env[name];
  if (!v || !v.includes(':')) {
    console.error(`Set ${name}=email:password in your shell.`);
    process.exit(1);
  }
  const i = v.indexOf(':');
  return { email: v.slice(0, i), password: v.slice(i + 1) };
};
if (!url || !anon) {
  console.error('Need EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (from .env).');
  process.exit(1);
}
if (!process.argv.includes('--yes')) {
  console.error(`This will place a real test order on ${url}.\nRe-run with --yes to continue.`);
  process.exit(1);
}

const shopper = creds('TEST_SHOPPER');
const vendorA = creds('VENDOR_A');
const vendorB = creds('VENDOR_B');

let failures = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
};

/** A fresh client per person, so sessions never mix. */
async function signIn({ email, password }) {
  const c = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign in failed for ${email}: ${error.message}`);
  return c;
}

const S = await signIn(shopper);
const A = await signIn(vendorA);
const B = await signIn(vendorB);

// Which shops do the two vendors own?
const shopOf = async (c) => (await c.from('shops').select('id, name').limit(1).maybeSingle()).data;
const shopA = await shopOf(A);
const shopB = await shopOf(B);
check('vendors own two different shops', shopA && shopB && shopA.id !== shopB.id, `${shopA?.name} / ${shopB?.name}`);

// One in-stock variant from each shop, found the way a shopper would (public read).
async function pickVariant(shopId) {
  const { data } = await S.from('product_variants')
    .select('id, stock, size, colour_name, products!inner(name, shop_id, status)')
    .eq('products.shop_id', shopId)
    .eq('products.status', 'published')
    .gt('stock', 0)
    .limit(1);
  return data?.[0];
}
const vA = await pickVariant(shopA.id);
const vB = await pickVariant(shopB.id);
check('each shop has a published, in-stock variant', !!vA && !!vB);
if (!vA || !vB) process.exit(1);

// 1. Place the order.
const { data: orderId, error } = await S.rpc('place_order', {
  items: [
    { variant_id: vA.id, quantity: 1 },
    { variant_id: vB.id, quantity: 1 },
  ],
  delivery: { name: 'Test Shopper', phone: '08030000000', address: '1 Test Street', city: 'Lagos' },
});
check('place_order accepted a two-shop order', !error && !!orderId, error?.message);
if (error) process.exit(1);

// 2. Each vendor sees only their own part, and moves it forward.
for (const [label, client, shop] of [['A', A, shopA], ['B', B, shopB]]) {
  const { data: mine } = await client.from('order_fulfillments').select('id, shop_id, status').eq('order_id', orderId);
  check(`vendor ${label} sees only their own fulfillment`, mine?.length === 1 && mine[0].shop_id === shop.id);
  const { data: items } = await client.from('order_items').select('shop_id').eq('order_id', orderId);
  check(`vendor ${label} sees only their own items`, items?.length === 1 && items[0].shop_id === shop.id);
  const f = mine?.[0];
  const step = async (to, from) => (await client.from('order_fulfillments').update({ status: to }).eq('id', f.id).eq('status', from).select('id')).error;
  check(`vendor ${label}: reserved -> confirmed`, !(await step('confirmed', 'reserved')));
  const skip = await client.from('order_fulfillments').update({ status: 'delivered' }).eq('id', f.id).select('id');
  check(`vendor ${label}: cannot jump confirmed -> delivered`, !!skip.error);
  check(`vendor ${label}: confirmed -> shipped`, !(await step('shipped', 'confirmed')));
}

// 3. The shopper sees both timelines.
const { data: order } = await S.from('orders')
  .select('order_number, order_fulfillments(status, history, shops(name))')
  .eq('id', orderId)
  .single();
const fs = order?.order_fulfillments ?? [];
check('shopper sees one fulfillment per shop', fs.length === 2, fs.map((f) => f.shops?.name).join(' + '));
check('both are shipped', fs.length === 2 && fs.every((f) => f.status === 'shipped'));
check('each has reserved, confirmed and shipped in its history', fs.every((f) => ['reserved', 'confirmed', 'shipped'].every((k) => k in (f.history ?? {}))));
console.log(`\nOrder #${order?.order_number} (${orderId})`);

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
