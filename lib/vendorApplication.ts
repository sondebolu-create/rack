import { useCallback, useEffect, useState } from 'react';
import { SELLABLE_CATEGORIES, categoryLabel } from '@/lib/categories';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type ApplicationRow = Database['public']['Tables']['vendor_applications']['Row'];
export type ApplicationStatus = ApplicationRow['status'];

export const MAX_PHOTOS = 3;
const BUCKET = 'application-photos';

/** The store categories, minus the "All" tab. Stored by id (matches products.category); shown by label. */
export const APPLICATION_CATEGORIES = SELLABLE_CATEGORIES;
export { categoryLabel };

// ------------------------------------------------------------------ form + validation

export type ApplicationForm = {
  businessName: string;
  instagram: string;
  phone: string;
  city: string;
  categories: string[];
  /** Local (already compressed) photo URIs, up to MAX_PHOTOS. */
  photos: string[];
  note: string;
};

export const EMPTY_FORM: ApplicationForm = {
  businessName: '',
  instagram: '',
  phone: '',
  city: 'Lagos',
  categories: [],
  photos: [],
  note: '',
};

export type FormErrors = Partial<Record<'businessName' | 'instagram' | 'phone' | 'city' | 'categories' | 'photos', string>>;

/** "@my.shop" or "instagram.com/my.shop" -> "my.shop". Returns '' when empty. */
export function cleanInstagram(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
}

export const instagramUrl = (handle: string) =>
  /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://instagram.com/${handle}` : null;

/** Steps: 0 business, 1 categories, 2 photos, 3 note + review. Returns errors for one step. */
export function validateStep(step: number, f: ApplicationForm): FormErrors {
  const e: FormErrors = {};
  if (step === 0) {
    if (!f.businessName.trim()) e.businessName = 'Enter your business name.';
    else if (f.businessName.trim().length > 100) e.businessName = 'Keep it to 100 characters.';
    const ig = cleanInstagram(f.instagram);
    if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) e.instagram = 'Use letters, numbers, dots and underscores only.';
    const digits = f.phone.replace(/[\s()+-]/g, '');
    if (!f.phone.trim()) e.phone = 'Enter a phone number.';
    else if (!/^\d{10,15}$/.test(digits)) e.phone = 'Enter a valid phone number, 10 to 15 digits.';
    if (!f.city.trim()) e.city = 'Enter your city.';
  }
  if (step === 1 && f.categories.length === 0) e.categories = 'Pick at least one category.';
  return e;
}

// ------------------------------------------------------------------ vendor side

/** Uploads the photos, then writes the pending row. Nothing is kept if the row fails. */
export async function submitApplication(userId: string, f: ApplicationForm): Promise<{ error?: string }> {
  const uploaded: string[] = [];
  try {
    for (const uri of f.photos) {
      const blob = await (await fetch(uri)).blob();
      const type = blob.type === 'image/png' || blob.type === 'image/webp' ? blob.type : 'image/jpeg';
      const path = `${userId}/${Date.now()}-${uploaded.length}.${type === 'image/jpeg' ? 'jpg' : type.slice(6)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type });
      if (error) throw new Error('photo');
      uploaded.push(path);
    }
    const ig = cleanInstagram(f.instagram);
    const { error } = await supabase.from('vendor_applications').insert({
      user_id: userId,
      business_name: f.businessName.trim(),
      instagram_handle: ig || null,
      phone: f.phone.trim(),
      city: f.city.trim(),
      categories: f.categories,
      sample_photo_urls: uploaded,
      note: f.note.trim() || null,
    });
    if (error) throw new Error(error.code === '23505' ? 'pending' : 'row');
    return {};
  } catch (e) {
    if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
    const why = e instanceof Error ? e.message : '';
    if (why === 'pending') return { error: 'You already have an application waiting for review.' };
    if (why === 'photo') return { error: 'A photo could not be uploaded. Remove it or try another, then submit again.' };
    return { error: 'Could not send your application. Check your connection and try again.' };
  }
}

/** The signed-in user's most recent application (RLS limits the query to their own rows). */
export function useMyApplication() {
  const [application, setApplication] = useState<ApplicationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('vendor_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setApplication(data);
    setLoading(false);
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { application, loading, reload };
}

// ------------------------------------------------------------------ admin side (RLS: admins only)

export async function listApplications(status: ApplicationStatus | 'all') {
  let q = supabase.from('vendor_applications').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') q = q.eq('status', status);
  return q;
}

export const getApplication = (id: string) => supabase.from('vendor_applications').select('*').eq('id', id).maybeSingle();

/** Time-limited links to the private photos, keyed by storage path. Admins can sign them because the bucket policy lets them read. */
export async function signedPhotoMap(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  const map: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  return map;
}

/** approve_vendor() grants the role, creates the draft shop and marks the row approved, all in one transaction. */
export async function approveApplication(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.rpc('approve_vendor', { application_id: id });
  if (!error) return {};
  if (error.code === '42501') return { error: 'Only admins can approve applications.' };
  if (error.code === '22023') return { error: 'This application has already been reviewed. Refresh the list.' };
  return { error: 'Could not approve. Try again.' };
}

export async function rejectApplication(id: string, reviewerId: string, note: string): Promise<{ error?: string }> {
  const { data, error } = await supabase
    .from('vendor_applications')
    .update({ status: 'rejected', review_note: note.trim(), reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id');
  if (error) return { error: 'Could not reject. Try again.' };
  // RLS hides rows you can't update, so "0 rows" means not an admin or already reviewed.
  if (!data?.length) return { error: 'This application has already been reviewed. Refresh the list.' };
  return {};
}
