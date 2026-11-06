import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { ReceiptSheet } from '@/components/checkout/ReceiptSheet';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatDate, formatPrice } from '@/lib/format';
import { useOrder, useOrdersStore } from '@/lib/orders';

/** M8 Order Confirmed. Figma 318:4474. */
export default function OrderConfirmed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useOrder(id);
  const [receiptOpen, setReceiptOpen] = useState(false);
  if (!order) return <Redirect href="/home" />;

  const units = order.items.reduce((n, i) => n + i.qty, 0);
  const pickup = order.delivery === 'pickup';

  return (
    <>
      {/* The order is done, so there is no way back into Checkout. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <FlowScreen
        back={false}
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
              Your order has been confirmed
            </Text>
            <Text className="text-muted">Thank you for your purchase</Text>
          </View>
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text weight="medium">Order #{order.id}</Text>
            {pickup ? null : order.addressFlagged ? (
              <Text accessibilityLiveRegion="polite" className="text-xs">
                Address flagged
              </Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Flag Address"
                hitSlop={{ top: 14, bottom: 14, left: 12, right: 0 }}
                onPress={() => useOrdersStore.getState().flagAddress(order.id)}>
                <Text weight="medium" className="text-xs text-danger underline">
                  Flag Address
                </Text>
              </Pressable>
            )}
          </View>
          <View className="gap-2 rounded-lg bg-card p-2">
            <View className="flex-row items-start justify-between gap-4">
              <Text weight="medium" className="text-primary-hover">
                Estimated Delivery
              </Text>
              <Text weight="medium" className="text-xs">
                {pickup ? 'Ready ' : 'Arrives '}
                {formatDate(order.estimatedDeliveryAt)}
              </Text>
            </View>
            <View className="flex-row items-start justify-between gap-4">
              <Text weight="medium" className="text-primary-hover">
                {pickup ? 'Collection' : 'Delivery Address'}
              </Text>
              <Text className="flex-1 text-right">{pickup ? 'Store pick-up' : (order.address?.line1 ?? '')}</Text>
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
                  source={i.product.image}
                  accessibilityLabel={`${i.product.name}, size ${i.size}, ${i.color}, quantity ${i.qty}`}
                  contentFit="cover"
                  className="h-[67px] w-[63px] rounded-lg"
                />
              ))}
            </View>
          </View>
          <View className="flex-row items-center justify-between border-t border-line pt-2">
            <Text weight="medium" className="text-xs text-primary-hover">
              Total Paid
            </Text>
            <Text weight="medium" className="text-xs">
              {formatPrice(order.totalMinor, order.currency)}
            </Text>
          </View>
        </View>

        <ReceiptSheet order={order} visible={receiptOpen} onClose={() => setReceiptOpen(false)} />
      </FlowScreen>
    </>
  );
}
