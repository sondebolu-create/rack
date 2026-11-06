import { Redirect, useLocalSearchParams } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { OrderTimeline } from '@/components/checkout/OrderTimeline';
import { Button } from '@/components/ui/Button';
import { useOrder, useOrdersStore } from '@/lib/orders';

/** M9 Track Order. Figma 318:4429. */
export default function TrackOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);
  if (!order) return <Redirect href="/home" />;

  return (
    <FlowScreen title="Track Order" subtitle={`Order#${order.id}`}>
      <OrderTimeline order={order} />
      {/* Stand-in for vendor order status (V3), so every state can be seen in development. */}
      {__DEV__ && order.status !== 'delivered' ? (
        <Button
          label="Advance status (dev)"
          variant="secondary"
          fullWidth={false}
          onPress={() => useOrdersStore.getState().advance(order.id)}
        />
      ) : null}
    </FlowScreen>
  );
}
