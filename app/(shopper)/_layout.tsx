import { Stack } from 'expo-router';
import { AppFrame } from '@/components/ui/AppFrame';

/** Everything a shopper sees. Phone width on every device; see AppFrame. */
export default function ShopperLayout() {
  return (
    <AppFrame>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
    </AppFrame>
  );
}
