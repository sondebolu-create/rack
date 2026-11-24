import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { QueryState } from '@/components/ui/QueryState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { STATUS_LABEL, type FulfillmentStatus } from '@/lib/fulfillments';
import { formatDate, formatPrice } from '@/lib/format';
import { useMyOrders, type MyOrder } from '@/lib/queries/orders';

/** One word for the order: the shared status when every shop is at the same step, otherwise "In progress". */
function summary(o: MyOrder): string {
  const set = new Set(o.order_fulfillments.map((f) => f.status));
  if (set.size === 1) return STATUS_LABEL[[...set][0] as FulfillmentStatus] ?? 'In progress';
  return 'In progress';
}

/** Orders (opened from Settings): this shopper's real orders. There is no Figma frame for it yet. */
export default function Orders() {
  const router = useRouter();
  const q = useMyOrders();
  const orders = q.data ?? [];

  return (
    <FlowScreen title="Orders" subtitle={q.data ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : undefined}>
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        onRetry={() => void q.refetch()}
        isEmpty={orders.length === 0}
        emptyText="No orders yet."
        skeleton={
          <View className="gap-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </View>
        }>
        <View className="gap-3">
          {orders.map((o) => (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityLabel={`Order ${o.order_number}, ${summary(o)}, ${formatPrice(o.total_minor, o.currency)}`}
              onPress={() => router.push(`/order/${o.id}/track`)}
              className="min-h-11 gap-1 rounded-lg bg-card p-3">
              <View className="flex-row items-center justify-between">
                <Text weight="medium">Order #{o.order_number}</Text>
                <Text weight="medium" className="text-xs">
                  {formatPrice(o.total_minor, o.currency)}
                </Text>
              </View>
              <Text className="text-xs text-primary-hover">
                {summary(o)} · {formatDate(Date.parse(o.created_at))}
              </Text>
            </Pressable>
          ))}
        </View>
      </QueryState>
    </FlowScreen>
  );
}
