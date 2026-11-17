import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { VendorShell } from '@/components/auth/VendorShell';
import { StatusPanel } from '@/components/vendor/StatusPanel';
import { refreshProfile, useAuthStore } from '@/lib/auth';
import { useMyApplication } from '@/lib/vendorApplication';
import { colors } from '@/theme';

/** V1 Application status: pending, rejected (with the reviewer's note) or approved. */
export default function VendorApplication() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const { application, loading, reload } = useMyApplication();

  // The role may have changed since sign-in (approved in another window), so re-read it when this opens.
  useEffect(() => {
    void refreshProfile();
  }, []);

  if (loading) {
    return (
      <VendorShell title="Application status">
        <View className="items-center py-8">
          <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} />
        </View>
      </VendorShell>
    );
  }
  if (!application) return <Redirect href="/vendor/apply" />;

  return (
    <VendorShell title="Application status">
      <StatusPanel
        application={application}
        isVendor={role === 'vendor'}
        onRefresh={async () => {
          await refreshProfile();
          await reload();
        }}
        onApplyAgain={() => router.push('/vendor/apply')}
        onOpenDashboard={() => router.replace('/vendor')}
      />
    </VendorShell>
  );
}
