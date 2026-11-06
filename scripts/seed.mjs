// Seeds the hosted project with 3 invented brands, their shops and 18 products, using the
// bundled mock photos. Safe to re-run: it replaces the seed shops' products each time.
//
//   SUPABASE_SERVICE_ROLE_KEY=<key> node --env-file=.env scripts/seed.mjs --yes
//
// The service-role key bypasses RLS, so it is read from your shell at run time ONLY.
// It must never go in .env, .env.example, app code or git. The script refuses to run without
// --yes and prints which project it is about to write to.
//
// All brand names below are invented. Check they don't collide with a real business before launch.

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Need EXPO_PUBLIC_SUPABASE_URL (from .env) and SUPABASE_SERVICE_ROLE_KEY (from your shell).');
  process.exit(1);
}
if (!process.argv.includes('--yes')) {
  console.error(`This will write seed data to ${url}.\nRe-run with --yes to continue.`);
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MOCK = join(root, 'assets/images/mock');

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

// ---------------------------------------------------------------------------- photos
// file -> alt text (same wording as lib/mock/home.ts)
const PHOTOS = {
  gown: ['look-gown.jpg', 'Woman in a peach tiered ruffle gown'],
  green1: ['explore-1.png', 'Woman in a green print dress holding a white bag'],
  green2: ['explore-2.png', 'Woman posing in a green print dress'],
  green3: ['explore-3.png', 'Close-up of a green print dress'],
  green4: ['explore-4.png', 'Detail of a green print dress'],
  shirtWhite: ['shirt-white.png', 'Man wearing a white patterned short-sleeve shirt'],
  shirtGreen: ['shirt-green.png', 'Man wearing a green and cream patterned buba'],
};

// ---------------------------------------------------------------------------- brands
const COLOURS = {
  White: '#ffffff',
  Black: '#000000',
  Green: '#00a63e',
  Red: '#c10007',
  Peach: '#ffcba4',
  Cream: '#f5efe0',
};

const BRANDS = [
  {
    email: 'seed-adire-house@seed.rack.invalid',
    shop: {
      name: 'Adire House',
      slug: 'adire-house',
      description: 'Hand-dyed adire prints turned into gowns and occasion wear. Made in Abeokuta, finished in Lagos.',
      city: 'Lagos',
      categories: ['gowns'],
      gender_focus: 'women',
      featured: true,
    },
    products: [
      ['Elegant Gown', 'gowns', 'women', 5_799_900, ['gown', 'green1'], ['S', 'M', 'L'], ['Peach', 'White'], true],
      ['Ruffle Tier Gown', 'gowns', 'women', 6_500_000, ['gown', 'green3'], ['S', 'M', 'L', 'XL'], ['Peach', 'Red']],
      ['Emerald Print Dress', 'gowns', 'women', 3_850_000, ['green1', 'green2', 'green4'], ['XS', 'S', 'M'], ['Green']],
      ['Garden Party Dress', 'gowns', 'women', 4_200_000, ['green2', 'green3'], ['S', 'M', 'L'], ['Green', 'Cream']],
      ['Casual Summer Dress', 'gowns', 'women', 2_950_000, ['green4', 'green1'], ['XS', 'S', 'M', 'L'], ['Green', 'White']],
      ['Midi Wrap Dress', 'gowns', 'women', 3_400_000, ['green3', 'green2'], ['M', 'L', 'XL'], ['Green', 'Black']],
    ],
  },
  {
    email: 'seed-eko-tailoring@seed.rack.invalid',
    shop: {
      name: 'Eko Tailoring Co',
      slug: 'eko-tailoring-co',
      description: 'Sharp everyday menswear: printed shirts, bubas and office pieces cut to measure on the Island.',
      city: 'Lagos',
      categories: ['corporate'],
      gender_focus: 'men',
      featured: false,
    },
    products: [
      ['Drew’s Shirt', 'corporate', 'men', 5_799_900, ['shirtWhite'], ['M', 'L'], ['White', 'Black'], true],
      ['Rich Man Buba', 'corporate', 'men', 5_799_900, ['shirtGreen'], ['M', 'L', 'XL'], ['Green']],
      ['Palm Print Shirt', 'corporate', 'men', 3_200_000, ['shirtWhite', 'shirtGreen'], ['S', 'M', 'L', 'XL'], ['White', 'Cream']],
      ['Boardroom Buba', 'corporate', 'men', 4_800_000, ['shirtGreen'], ['M', 'L', 'XL', 'XXL'], ['Green', 'Black']],
      ['Weekend Short-Sleeve', 'corporate', 'men', 2_600_000, ['shirtWhite'], ['S', 'M', 'L'], ['White']],
      ['Sunday Best Buba', 'corporate', 'men', 6_100_000, ['shirtGreen', 'shirtWhite'], ['L', 'XL', 'XXL'], ['Cream', 'Green']],
    ],
  },
  {
    email: 'seed-zuri-lane@seed.rack.invalid',
    shop: {
      name: 'Zuri Lane',
      slug: 'zuri-lane',
      description: 'Relaxed pieces for women and men, one print story at a time.',
      city: 'Abuja',
      categories: ['gowns', 'corporate'],
      gender_focus: 'both',
      featured: false,
    },
    products: [
      ['Zuri Evening Gown', 'gowns', 'women', 7_200_000, ['gown', 'green2'], ['S', 'M', 'L'], ['Peach', 'Black']],
      ['Lane Shirt Dress', 'gowns', 'women', 3_100_000, ['green1', 'green4'], ['XS', 'S', 'M', 'L'], ['Green', 'White']],
      ['Resort Maxi', 'gowns', 'women', 4_450_000, ['green3', 'gown'], ['M', 'L', 'XL'], ['Red', 'Green']],
      ['Lane Camp Shirt', 'corporate', 'men', 2_900_000, ['shirtWhite'], ['M', 'L', 'XL'], ['White', 'Green']],
      ['Zuri Statement Buba', 'corporate', 'men', 5_250_000, ['shirtGreen'], ['M', 'L'], ['Green', 'Cream']],
      ['Twin Print Set', 'corporate', 'both', 6_800_000, ['green1', 'shirtGreen'], ['S', 'M', 'L'], ['Green']],
    ],
  },
];

// ---------------------------------------------------------------------------- helpers
function fail(what, error) {
  console.error(`✗ ${what}: ${error.message}`);
  process.exit(1);
}

async function ensureUser(email) {
  // Seed vendors can't sign in: the password is random and thrown away.
  const password = crypto.randomUUID() + crypto.randomUUID();
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (!error) return data.user.id;
  const { data: list, error: listError } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) fail('list users', listError);
  const existing = list.users.find((u) => u.email === email);
  if (!existing) fail(`create user ${email}`, error);
  return existing.id;
}

const uploaded = new Map(); // `${shopId}/${key}` -> public url
async function uploadPhoto(shopId, key) {
  const id = `${shopId}/${key}`;
  if (uploaded.has(id)) return uploaded.get(id);
  const [file] = PHOTOS[key];
  const ext = extname(file).toLowerCase();
  const path = `${shopId}/seed/${key}${ext}`;
  const body = await readFile(join(MOCK, file));
  const { error } = await db.storage
    .from('product-images')
    .upload(path, body, { contentType: ext === '.png' ? 'image/png' : 'image/jpeg', upsert: true });
  if (error) fail(`upload ${file}`, error);
  const { data } = db.storage.from('product-images').getPublicUrl(path);
  uploaded.set(id, data.publicUrl);
  return data.publicUrl;
}

// Deterministic, varied stock so the app shows some low and some sold-out variants.
let n = 0;
const stockFor = () => [0, 2, 3, 5, 8, 12][n++ % 6];

// ---------------------------------------------------------------------------- run
console.log(`Seeding ${url}`);
let productCount = 0;

for (const brand of BRANDS) {
  const ownerId = await ensureUser(brand.email);

  const { data: shop, error: shopError } = await db
    .from('shops')
    .upsert({ ...brand.shop, owner_id: ownerId, status: 'live' }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (shopError) fail(`shop ${brand.shop.name}`, shopError);

  // The role is not editable through the API; seed vendors get it directly. This runs with the service role.
  const { error: roleError } = await db.from('profiles').update({ role: 'vendor' }).eq('id', ownerId);
  if (roleError) fail(`role for ${brand.shop.name}`, roleError);

  // Banner + logo from the first product photos
  const bannerKey = brand.products[0][4][0];
  const bannerPath = await uploadPhoto(shop.id, bannerKey);
  await db.from('shops').update({ banner_url: bannerPath, logo_url: bannerPath }).eq('id', shop.id);

  // Re-seed: drop this shop's products (images and variants cascade), then recreate.
  const { error: delError } = await db.from('products').delete().eq('shop_id', shop.id);
  if (delError) fail(`clear ${brand.shop.name}`, delError);

  for (const [name, category, gender, price, photoKeys, sizes, colours, featured = false] of brand.products) {
    const { data: product, error } = await db
      .from('products')
      .insert({
        shop_id: shop.id,
        name,
        description: `${name} by ${brand.shop.name}.`,
        category,
        gender,
        price_minor: price,
        currency: 'NGN',
        status: 'published',
        featured,
      })
      .select('id')
      .single();
    if (error) fail(`product ${name}`, error);

    const images = [];
    for (const [i, key] of photoKeys.entries()) {
      images.push({ product_id: product.id, url: await uploadPhoto(shop.id, key), alt: PHOTOS[key][1], position: i });
    }
    const { error: imgError } = await db.from('product_images').insert(images);
    if (imgError) fail(`images for ${name}`, imgError);

    const variants = sizes.flatMap((size) =>
      colours.map((colour) => ({
        product_id: product.id,
        size,
        colour_name: colour,
        colour_hex: COLOURS[colour],
        stock: stockFor(),
        sku: `${brand.shop.slug}-${product.id.slice(0, 6)}-${size}-${colour}`.toLowerCase().replace(/\s+/g, '-'),
      }))
    );
    const { error: varError } = await db.from('product_variants').insert(variants);
    if (varError) fail(`variants for ${name}`, varError);
    productCount++;
  }
  console.log(`✓ ${brand.shop.name}: ${brand.products.length} products`);
}

console.log(`Done. ${BRANDS.length} shops, ${productCount} products.`);
