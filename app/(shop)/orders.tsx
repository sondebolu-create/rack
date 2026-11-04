import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { Text } from '@/components/ui/Text';
import { formatDate, formatPrice } from '@/lib/format';
import { ORDER_STEPS, useOrdersStore } from '@/lib/orders';

/** Orders tab: a simple list of this session's orders. There is no Figma frame for it yet. */
export default function Orders() {
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);

  return (
    <FlowScreen back={false} title="Orders" subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}>
      {orders.length === 0 ? <Text>No orders yet.</Text> : null}
      <View className="gap-3">
        {orders.map((o) => {
          const status = ORDER_STEPS.find((s) => s.status === o.status)?.title ?? '';
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityLabel={`Order ${o.id}, ${status}, ${formatPrice(o.totalMinor, o.currency)}`}
              onPress={() => router.push(`/order/${o.id}/track`)}
              className="min-h-11 gap-1 rounded-lg bg-card p-3">
              <View className="flex-row items-center justify-between">
                <Text weight="medium">Order #{o.id}</Text>
                <Text weight="medium" className="text-xs">
                  {formatPrice(o.totalMinor, o.currency)}
                </Text>
              </View>
              <Text className="text-xs text-primary-hover">
                {status} · {formatDate(o.createdAt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FlowScreen>
  );
}
