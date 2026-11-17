import { Stack } from 'expo-router';
import { Gate } from '@/components/auth/Gate';

/** Everything under /admin. Admins only on the client; RLS (is_admin) is the real lock. */
export default function AdminLayout() {
  return (
    <Gate need="admin">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
    </Gate>
  );
}
