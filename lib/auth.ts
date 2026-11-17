import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import type { Href } from 'expo-router';
import { create } from 'zustand';
import { useCartStore } from '@/lib/cart';
import { useCheckoutStore } from '@/lib/checkout';
import { queryClient } from '@/lib/queries/client';
import { supabase } from '@/lib/supabase';

export type Role = 'shopper' | 'vendor' | 'admin';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

type AuthState = {
  /** `loading` until the stored session has been restored AND, if there is one, the profile has loaded. */
  status: 'loading' | 'ready';
  session: Session | null;
  /** From `profiles.role`. Used only to choose what to show: the server decides what is allowed (RLS). */
  role: Role;
  /** The user's most recent vendor application, if any. */
  application: ApplicationStatus | null;
};

export const useAuthStore = create<AuthState>(() => ({
  status: 'loading',
  session: null,
  role: 'shopper',
  application: null,
}));

// Guards against a slow profile fetch for user A landing after user B signed in.
let loadToken = 0;

async function loadProfile(userId: string) {
  const token = ++loadToken;
  const [profile, application] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
    supabase
      .from('vendor_applications')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (token !== loadToken) return;
  // Fail closed: if the lookup fails, treat the user as a plain shopper.
  useAuthStore.setState({
    status: 'ready',
    role: profile.data?.role ?? 'shopper',
    application: application.data?.status ?? null,
  });
}

let started = false;

/** Subscribes to Supabase auth once. Call from the root layout. */
export function startAuth() {
  if (started) return;
  started = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    const prev = useAuthStore.getState();
    if (!session) {
      loadToken++;
      useAuthStore.setState({ status: 'ready', session: null, role: 'shopper', application: null });
      return;
    }
    const sameUser = prev.session?.user.id === session.user.id && prev.status === 'ready';
    // Token refreshes and tab-focus SIGNED_IN events keep the same user: don't flash the loading state.
    useAuthStore.setState(sameUser ? { session } : { status: 'loading', session });
    if (!sameUser) {
      // Supabase warns against awaiting other Supabase calls inside this callback, so defer.
      setTimeout(() => void loadProfile(session.user.id), 0);
    }
  });
}

export function useStartAuth() {
  useEffect(startAuth, []);
}

/** Re-reads role and application, e.g. after the user submits an application. */
export async function refreshProfile() {
  const id = useAuthStore.getState().session?.user.id;
  if (id) await loadProfile(id);
}

export async function signOut() {
  await supabase.auth.signOut();
  // This device may be shared: don't leave one person's cart and orders for the next.
  useCartStore.getState().clear();
  useCheckoutStore.getState().reset();
  queryClient.clear(); // cached orders and profile belong to the person who just left
}

// ------------------------------------------------------------------ routing

/** Accepts only in-app paths, so a crafted `?redirect=` can't send someone to another site. */
export function safeRedirect(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v || !v.startsWith('/') || v.startsWith('//') || v.includes('\\')) return null;
  if (v.startsWith('/login') || v.startsWith('/onboarding') || v.startsWith('/reset-password')) return null;
  return v;
}

export type Intent = 'shop' | 'sell';

/** Where someone lands after signing in with nowhere in particular to return to. */
export function landingFor(
  a: Pick<AuthState, 'role' | 'application'>,
  intent: Intent = 'shop'
): Href {
  if (a.role === 'vendor') return '/vendor';
  // An applicant lands on their status until approved (pending, or rejected with a note and a way to re-apply).
  if (a.application === 'pending' || a.application === 'rejected') return '/vendor/application';
  if (a.role === 'shopper' && intent === 'sell') return '/vendor/apply';
  // Admins land on Home like everyone else; /admin is one tap away from Account.
  return '/home';
}

// ------------------------------------------------------------------ redirect URLs

/**
 * Where Supabase email links and Google send people back to. On web this is the current origin,
 * so localhost works in dev. TODO(launch): add the production domain to Supabase Auth > URL
 * Configuration (Site URL + Redirect URLs) and to `additional_redirect_urls` in supabase/config.toml.
 */
export function authRedirectUrl(path: '/login' | '/reset-password'): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return Linking.createURL(path);
}

/**
 * Google sign-in is hidden until the provider is enabled in Supabase (Dashboard > Authentication > Providers).
 * To turn it on: enable Google there, then set EXPO_PUBLIC_GOOGLE_AUTH=true in .env and restart the dev server.
 */
export const GOOGLE_AUTH_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_AUTH === 'true';
