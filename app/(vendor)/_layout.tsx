import { Stack } from 'expo-router';
import { Gate } from '@/components/auth/Gate';

/** Everything under /vendor. Signed-in only here; the dashboard adds the vendor-role check. Full width, no AppFrame. */
export default function VendorLayout() {
  return (
    <Gate need="user">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
    </Gate>
  );
}
