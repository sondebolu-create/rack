import { View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { FulfillmentTimeline } from '@/components/checkout/FulfillmentTimeline';
import { QueryState } from '@/components/ui/QueryState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTrackedOrder } from '@/lib/queries/orders';

/** M9 Track Order. Figma 318:4429. Reads the real order_fulfillments: one timeline per shop, so a multi-shop order shows each shop's progress. */
export default function TrackOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useTrackedOrder(id);
  const data = q.data;
  if (!q.isLoading && !q.isError && !data) return <Redirect href="/home" />;
  const several = (data?.fulfillments.length ?? 0) > 1;

  return (
    <FlowScreen title="Track Order" subtitle={data ? `Order#${data.order_number}` : undefined}>
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        onRetry={() => void q.refetch()}
        isEmpty={false}
        emptyText=""
        skeleton={
          <View className="gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </View>
        }>
        {several ? <Text className="text-primary-hover">Your order comes from {data!.fulfillments.length} shops. Each one ships on its own.</Text> : null}
        {(data?.fulfillments ?? []).map((f) => (
          <View key={f.id} className="gap-3">
            <View className="gap-0.5">
              <Text weight="medium" accessibilityRole="header" className="text-lg">
                {f.shops?.name ?? 'Shop'}
              </Text>
              {f.items.length ? <Text className="text-xs text-primary-hover">{f.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</Text> : null}
            </View>
            <FulfillmentTimeline fulfillment={f} />
          </View>
        ))}
      </QueryState>
    </FlowScreen>
  );
}
