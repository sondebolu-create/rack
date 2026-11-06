import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Database } from '@/lib/database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.'
  );
}

const isWeb = Platform.OS === 'web';

/**
 * One client for the whole app. Only the anon key lives here: what a user can do is decided by
 * row-level security, never by this client. Service-role keys stay server-side.
 *
 * Session persistence: AsyncStorage maps to localStorage on web and to native storage on iOS, so
 * the same config works on both. `detectSessionInUrl` is web-only: it finishes the Google OAuth
 * redirect (M1) by reading the tokens from the URL. On iOS there is no URL to read.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

// On iOS, timers stop while the app is backgrounded. Pause token refresh then and resume on
// return so a long-lived session doesn't expire silently. Browsers keep their timers running.
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
