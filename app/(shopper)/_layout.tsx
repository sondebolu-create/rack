import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { AppFrame } from '@/components/ui/AppFrame';
import { useAuthStore } from '@/lib/auth';
import { colors } from '@/theme';

/**
 * Shopper routes that need an account. Everything else (Home, stores, products, cart) is open to guests.
 * One list here, so a new checkout-side screen can't be forgotten. Data is protected by RLS regardless.
 */
const SIGN_IN_REQUIRED = ['/checkout', '/review', '/rackgpt', '/orders', '/order', '/account'];

/** Sits beside the Stack (not around it) so moving between open and protected screens never remounts navigation. */
function SignInGuard() {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const protectedPath = SIGN_IN_REQUIRED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!protectedPath || (status === 'ready' && session)) return null;

  // Cover the screen while the stored session loads, so a guest never sees checkout flash by.
  if (status === 'loading') {
    return (
      <View className="absolute inset-0 items-center justify-center bg-surface">
        <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} />
      </View>
    );
  }
  return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
}

/** Everything a shopper sees. Phone width on every device; see AppFrame. */
export default function ShopperLayout() {
  return (
    <AppFrame>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
      <SignInGuard />
    </AppFrame>
  );
}
