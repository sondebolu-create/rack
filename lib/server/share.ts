import type { Metadata } from 'expo-server';
import { SITE_URL } from '@/lib/config';

/**
 * Share-preview metadata (title, description, Open Graph and Twitter tags) for a product or shop. Runs on the web
 * server inside each route's `generateMetadata`, so the tags are in the HTML that WhatsApp, X and Instagram fetch
 * (they don't run JavaScript). It uses plain fetch against Supabase's REST API with the public anon key: no auth
 * client, no storage. Row-level security still applies, so only published products of live shops come back.
 */
type ShareMeta = { title: string; description: string; image: string | null; url: string; alt: string };

function toMetadata(m: ShareMeta): Metadata {
  const images = m.image ? [{ url: m.image, alt: m.alt }] : undefined;
  return {
    title: m.title,
    description: m.description,
    openGraph: { title: m.title, description: m.description, siteName: BASE, type: 'website', ...(m.url.startsWith('http') ? { url: m.url } : {}), images },
    twitter: { card: m.image ? 'summary_large_image' : 'summary', title: m.title, description: m.description, images },
  };
}

const BASE = 'Rack';
const FALLBACK: Omit<ShareMeta, 'url'> = {
  alt: BASE,
  title: `${BASE}: fashion from Lagos vendors`,
  description: 'Find pieces from local fashion vendors in Lagos and reserve them in one place.',
  image: null,
};

async function rest<T>(path: string): Promise<T | null> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const clip = (s: string, n = 200) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const naira = (minor: number) => `₦${Math.round(minor / 100).toLocaleString('en-NG')}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function productMetadata(id: string): Promise<Metadata> {
  return toMetadata(await productMeta(id));
}

export async function shopMetadata(slug: string): Promise<Metadata> {
  return toMetadata(await shopMeta(slug));
}

async function productMeta(id: string): Promise<ShareMeta> {
  const url = `${SITE_URL}/product/${id}`;
  if (!UUID.test(id)) return { ...FALLBACK, url };
  type Row = { name: string; description: string | null; price_minor: number; shops: { name: string } | null; product_images: { url: string; position: number }[] };
  const rows = await rest<Row[]>(
    `products?id=eq.${id}&status=eq.published&select=name,description,price_minor,shops(name),product_images(url,position)&limit=1`,
  );
  const p = rows?.[0];
  if (!p) return { ...FALLBACK, url };
  const cover = [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url ?? null;
  const by = p.shops?.name ? ` by ${p.shops.name}` : '';
  return {
    title: `${p.name}${by} · ${BASE}`,
    description: clip(p.description?.trim() || `${p.name}${by}, ${naira(p.price_minor)}. Reserve it on ${BASE}.`),
    image: cover,
    alt: p.name,
    url,
  };
}

async function shopMeta(slug: string): Promise<ShareMeta> {
  const url = `${SITE_URL}/store/${slug}`;
  const key = UUID.test(slug) ? 'id' : 'slug';
  type Row = { name: string; description: string | null; city: string | null; banner_url: string | null; logo_url: string | null };
  const rows = await rest<Row[]>(`shops?${key}=eq.${encodeURIComponent(slug)}&status=eq.live&select=name,description,city,banner_url,logo_url&limit=1`);
  const s = rows?.[0];
  if (!s) return { ...FALLBACK, url };
  return {
    title: `${s.name} · ${BASE}`,
    description: clip(s.description?.trim() || `Shop ${s.name}${s.city ? ` in ${s.city}` : ''} on ${BASE}.`),
    image: s.banner_url ?? s.logo_url,
    alt: s.name,
    url,
  };
}
