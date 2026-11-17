import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { OrderFilterChips, OrderRowView, OrderTableHeader } from '@/components/vendor/orders/OrderParts';
import { listFulfillments, type FulfillmentStatus, type VendorListItem } from '@/lib/fulfillments';
import { colors } from '@/theme';

export default function VendorOrders() {
  return (
    <Gate need="vendor">
      <VendorShell title="Orders">
        <OrderList />
      </VendorShell>
    </Gate>
  );
}

function OrderList() {
  const router = useRouter();
  const [rows, setRows] = useState<VendorListItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<FulfillmentStatus | 'all'>('all');

  // Reloads every time the screen comes into focus: this is how new orders show up for now.
  // TODO(notifications): email / push alerts for new orders. The badge on the Orders link is the stand-in.
  const load = useCallback(() => {
    let live = true;
    void listFulfillments().then((r) => {
      if (!live) return;
      if (r.data) {
        setRows(r.data);
        setFailed(false);
      } else setFailed(true);
    });
    return () => {
      live = false;
    };
  }, []);
  useFocusEffect(load);

  const visible = useMemo(() => (rows ?? []).filter((r) => filter === 'all' || r.status === filter), [rows, filter]);

  if (failed) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className="text-danger">
          Could not load your orders.
        </Text>
        <Button variant="secondary" fullWidth={false} label="Try again" onPress={load} />
      </View>
    );
  }
  if (rows === null) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;

  return (
    <View className="gap-4">
      <OrderFilterChips value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <Text className="text-primary-hover">{rows.length ? 'No orders with that status.' : 'No orders yet. They show up here as soon as a shopper checks out.'}</Text>
      ) : (
        <View className="gap-3 lg:gap-0">
          <OrderTableHeader />
          {visible.map((r) => (
            <OrderRowView key={r.id} item={r} onOpen={() => router.push(`/vendor/orders/${r.id}`)} />
          ))}
        </View>
      )}
    </View>
  );
}
