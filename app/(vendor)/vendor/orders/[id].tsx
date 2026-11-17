import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { FulfillmentTimeline } from '@/components/checkout/FulfillmentTimeline';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { CustomerCard, FulfillmentBadge, ItemRows, OrderActions } from '@/components/vendor/orders/OrderParts';
import { advanceFulfillment, cancelFulfillment, loadFulfillment, type FulfillmentItem, type VendorFulfillment } from '@/lib/fulfillments';
import { formatDate, formatPrice } from '@/lib/format';
import { colors } from '@/theme';

export default function VendorOrderDetail() {
  return (
    <Gate need="vendor">
      <VendorShell title="Order">
        <Detail />
      </VendorShell>
    </Gate>
  );
}

function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ fulfillment: VendorFulfillment; items: FulfillmentItem[] } | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(() => {
    let live = true;
    void loadFulfillment(id).then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, [id]);
  useFocusEffect(load);

  const run = async (action: () => Promise<{ error?: string }>) => {
    setBusy(true);
    setError(undefined);
    const r = await action();
    if (r.error) setError(r.error);
    setData(await loadFulfillment(id)); // show whatever the database says now, success or not
    setBusy(false);
  };

  if (data === undefined) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;
  const back = <Button variant="secondary" fullWidth={false} label="Back to orders" onPress={() => router.replace('/vendor/orders')} />;
  if (data === null || !data.fulfillment.orders) {
    return (
      <View className="items-start gap-3">
        <Text>Order not found.</Text>
        {back}
      </View>
    );
  }

  const { fulfillment: f, items } = data;
  const o = f.orders!;
  const total = items.reduce((n, i) => n + i.quantity * i.unit_price_minor, 0);

  return (
    <View className="w-full max-w-[720px] gap-6">
      {back}
      <View className="gap-1">
        <View className="flex-row flex-wrap items-center gap-3">
          <Text weight="bold" className="text-xl">
            Order #{o.order_number}
          </Text>
          <FulfillmentBadge status={f.status} />
        </View>
        <Text className="text-primary-hover">Placed {formatDate(Date.parse(o.created_at))}</Text>
        {/* TODO(payments): until Paystack lands, orders are not paid. Gate "Mark as shipped" on payment then. */}
        {o.status === 'pending_payment' ? <Text className="text-primary-hover">Payment: not confirmed yet.</Text> : null}
      </View>

      <View className="gap-3">
        <Text weight="medium">Your items in this order</Text>
        <ItemRows items={items} currency={o.currency} />
        <View className="flex-row justify-between border-t border-line pt-3">
          <Text weight="medium">Total for your items</Text>
          <Text weight="medium">{formatPrice(total, o.currency)}</Text>
        </View>
      </View>

      <CustomerCard order={o} />

      <OrderActions
        status={f.status}
        busy={busy}
        error={error}
        onAdvance={() => void run(() => advanceFulfillment(f.id, f.status))}
        onCancel={(reason) => void run(() => cancelFulfillment(f.id, reason))}
      />

      <View className="gap-3">
        <Text weight="medium">Status</Text>
        <FulfillmentTimeline fulfillment={f} />
      </View>
    </View>
  );
}
