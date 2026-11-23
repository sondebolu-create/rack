import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { ReceiptSheet } from '@/components/checkout/ReceiptSheet';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatDate, formatPrice } from '@/lib/format';
import { QueryState } from '@/components/ui/QueryState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RESERVE_NOTE } from '@/lib/copy';
import { PAYMENTS_ENABLED } from '@/lib/flags';
import { useOrderDetail } from '@/lib/queries/orders';

/** M8 Order Confirmed. Figma 318:4474. */
export default function OrderConfirmed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const q = useOrderDetail(id);
  const order = q.data;
  const [receiptOpen, setReceiptOpen] = useState(false);
  if (q.isLoading || q.isError) {
    return (
      <FlowScreen back={false} pageTitle="Order reserved">
        <QueryState
          isLoading={q.isLoading}
          isError={q.isError}
          onRetry={() => void q.refetch()}
          isEmpty={false}
          emptyText=""
          skeleton={
            <View className="items-center gap-4 pt-8">
              <Skeleton className="h-[105px] w-[109px] rounded-full" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-24 w-full" />
            </View>
          }>
          {null}
        </QueryState>
      </FlowScreen>
    );
  }
  if (!order) return <Redirect href="/home" />;

  const units = order.items.reduce((n, i) => n + i.quantity, 0);
  const pickup = order.delivery_address === 'Store pick-up';
  // Not stored on the order: a simple estimate from when it was placed.
  const estimatedAt = Date.parse(order.created_at) + (pickup ? 1 : 3) * 24 * 60 * 60 * 1000;

  return (
    <>
      {/* The order is done, so there is no way back into Checkout. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <FlowScreen
        back={false}
        pageTitle="Order reserved"
        cta={{ label: 'Track Order', onPress: () => router.push(`/order/${order.id}/track`) }}
        footer={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Receipt"
            onPress={() => setReceiptOpen(true)}
            className="min-h-11 flex-row items-center justify-center gap-1">
            <Icon name="receipt" size={24} />
            <Text weight="medium" className="text-muted">
              View Receipt
            </Text>
          </Pressable>
        }>
        <View className="items-center gap-6 pt-8">
          <View accessible={false} className="h-[105px] w-[109px] items-center justify-center rounded-full bg-info">
            <Icon name="checkBig" size={40} />
          </View>
          <View accessible accessibilityRole="header" className="items-center gap-1">
            <Text weight="medium" className="text-xl">
              {PAYMENTS_ENABLED ? 'Your order has been confirmed' : 'Your order is reserved'}
            </Text>
            <Text className="text-center text-muted">{PAYMENTS_ENABLED ? 'Thank you for your purchase' : RESERVE_NOTE}</Text>
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text weight="medium">Order #{order.order_number}</Text>
          </View>
          <View className="gap-2 rounded-lg bg-card p-2">
            <View className="flex-row items-start justify-between gap-4">
              <Text weight="medium" className="text-primary-hover">
                Estimated Delivery
              </Text>
              <Text weight="medium" className="text-xs">
                {pickup ? 'Ready ' : 'Arrives '}
                {formatDate(estimatedAt)}
              </Text>
            </View>
            <View className="flex-row items-start justify-between gap-4">
              <Text weight="medium" className="text-primary-hover">
                {pickup ? 'Collection' : 'Delivery Address'}
              </Text>
              <Text className="flex-1 text-right">{pickup ? 'Store pick-up' : order.delivery_address}</Text>
            </View>
          </View>
        </View>

        <View className="gap-6 rounded-lg bg-card p-2">
          <View className="gap-2">
            <Text weight="medium">
              {units} {units === 1 ? 'Item' : 'Items'}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {order.items.map((i) => (
                <Image
                  key={i.id}
                  source={i.photo ? { uri: i.photo } : undefined}
                  accessibilityLabel={`${i.product_name}, size ${i.size}, ${i.colour_name}, quantity ${i.quantity}`}
                  contentFit="cover"
                  className="h-[67px] w-[63px] rounded-lg bg-strong"
                />
              ))}
            </View>
          </View>
          <View className="flex-row items-center justify-between border-t border-line pt-2">
            <Text weight="medium" className="text-xs text-primary-hover">
              {PAYMENTS_ENABLED ? 'Total Paid' : 'Total'}
            </Text>
            <Text weight="medium" className="text-xs">
              {formatPrice(order.total_minor, order.currency)}
            </Text>
          </View>
        </View>

        <ReceiptSheet order={order} visible={receiptOpen} onClose={() => setReceiptOpen(false)} />
      </FlowScreen>
    </>
  );
}
