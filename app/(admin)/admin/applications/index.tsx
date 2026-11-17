import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { VendorShell } from '@/components/auth/VendorShell';
import { ApplicationRowView, StatusFilter, TableHeader } from '@/components/admin/ApplicationViews';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { listApplications, signedPhotoMap, type ApplicationRow, type ApplicationStatus } from '@/lib/vendorApplication';
import { colors } from '@/theme';

/** V2 Admin: vendor applications. The (admin) layout requires the admin role; RLS returns rows to admins only. */
export default function Applications() {
  const router = useRouter();
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('pending');
  const [rows, setRows] = useState<ApplicationRow[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data, error } = await listApplications(filter);
      if (!live) return;
      if (error || !data) return setFailed(true);
      setUrls(await signedPhotoMap(data.flatMap((a) => a.sample_photo_urls)));
      if (live) setRows(data);
    })();
    return () => {
      live = false;
    };
  }, [filter, nonce]);

  // Reset in the handlers (not the effect) so a new filter or retry shows the spinner straight away.
  const reload = (next: ApplicationStatus | 'all' = filter) => {
    setRows(null);
    setFailed(false);
    setFilter(next);
    setNonce((n) => n + 1);
  };

  return (
    <VendorShell title="Vendor applications" links={[{ label: 'Applications', href: '/admin/applications' }]}>
      <StatusFilter value={filter} onChange={reload} />
      {failed ? (
        <View className="items-start gap-3">
          <Text accessibilityRole="alert" className="text-danger">
            Could not load applications.
          </Text>
          <Button variant="secondary" fullWidth={false} label="Try again" onPress={() => reload()} />
        </View>
      ) : rows === null ? (
        <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />
      ) : rows.length === 0 ? (
        <Text className="text-primary-hover">No {filter === 'all' ? '' : `${filter} `}applications.</Text>
      ) : (
        <View className="gap-3 lg:gap-0">
          <TableHeader />
          {rows.map((a) => (
            <ApplicationRowView key={a.id} app={a} urls={urls} onOpen={() => router.push(`/admin/applications/${a.id}`)} />
          ))}
        </View>
      )}
    </VendorShell>
  );
}
