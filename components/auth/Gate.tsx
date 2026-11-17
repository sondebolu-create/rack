import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, usePathname } from 'expo-router';
import { landingFor, useAuthStore } from '@/lib/auth';
import { colors } from '@/theme';

export type Need = 'user' | 'vendor' | 'admin';

/**
 * Client-side route guard. It only decides what to SHOW: every table is protected by row-level
 * security, so a shopper who gets past this still can't read or write vendor or admin data.
 *
 * Waits for the stored session to be restored first, so a refresh on a protected page doesn't
 * bounce a signed-in person to the login screen.
 */
export function Gate({ need, children }: { need: Need; children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} />
      </View>
    );
  }
  // Signed out: sign in, then come straight back here.
  if (!session) return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;

  const allowed = need === 'user' || (need === 'vendor' && role === 'vendor') || (need === 'admin' && role === 'admin');
  if (!allowed) return <Redirect href={landingFor({ role, application })} />;

  return <>{children}</>;
}
