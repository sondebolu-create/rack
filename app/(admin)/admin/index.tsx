import { VendorShell } from '@/components/auth/VendorShell';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

/** Admin home. The (admin) layout already requires the admin role. */
export default function AdminHome() {
  const router = useRouter();
  return (
    <VendorShell title="Admin" links={[{ label: 'Applications', href: '/admin/applications' }]}>
      <Button fullWidth={false} arrow label="Vendor applications" onPress={() => router.push('/admin/applications')} />
    </VendorShell>
  );
}
