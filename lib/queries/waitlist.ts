import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';

export type WaitlistFeature = 'rackgpt' | 'tryon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Adds an email to the waitlist table for one feature. Anyone may insert and nobody but admins can read, so this
 * never selects the row back. Joining twice is not an error: they are on the list either way.
 */
export async function joinWaitlist(email: string, feature: WaitlistFeature): Promise<{ ok: true } | { error: string }> {
  const e = email.trim();
  if (!EMAIL_RE.test(e)) return { error: 'Enter a valid email address.' };
  const { error } = await supabase.from('waitlist').insert({ email: e, feature });
  if (error && error.code !== '23505') {
    return { error: error.code === '23514' ? 'Enter a valid email address.' : 'Could not add you. Check your connection and try again.' };
  }
  track('waitlist_signup', { feature });
  return { ok: true };
}
