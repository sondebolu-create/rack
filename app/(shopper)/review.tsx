import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AddressSheet } from '@/components/checkout/AddressSheet';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { ItemRow } from '@/components/checkout/ItemRow';
import { IconBadge } from '@/components/checkout/PinBadge';
import { Text } from '@/components/ui/Text';
import { useCartStore } from '@/lib/cart';
import { useCheckoutStore, useSelectedAddress } from '@/lib/checkout';
import { useProfile } from '@/lib/queries/profile';
import { usePlaceOrder, type PlaceOrderError } from '@/lib/queries/orders';
import { Button } from '@/components/ui/Button';
import { track } from '@/lib/analytics';
import { RESERVE_NOTE } from '@/lib/copy';
import { PAYMENTS_ENABLED } from '@/lib/flags';

/** M8 Review Order. Figma 318:4386. "Proceed to Payment" calls place_order. Payment itself is mock until Paystack (Week 3). */
export default function Review() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const { delivery, payment, card, contactName, contactPhone } = useCheckoutStore();
  const profile = useProfile();
  const place = usePlaceOrder();
  const [failure, setFailure] = useState<PlaceOrderError | null>(null);
  const address = useSelectedAddress();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Set once the order is placed, so the emptied cart does not flash an empty state while the screen leaves.
  const [placed, setPlaced] = useState(false);

  if (items.length === 0) {
    if (placed) return null;
    return (
      <FlowScreen title={PAYMENTS_ENABLED ? 'Review Order' : 'Review Reservation'}>
        <Text>Your cart is empty.</Text>
      </FlowScreen>
    );
  }

  const missingAddress = delivery === 'delivery' && address === null;

  const placeOrder = async () => {
    if (missingAddress || place.isPending) return;
    setFailure(null);
    const pickup = delivery === 'pickup';
    // The address book keeps "line, city" in two fields; the order stores the city on its own.
    const city = (!pickup && address?.line2.split(',').pop()?.trim()) || profile.data?.city || 'Lagos';
    const result = await place.mutateAsync({
      items,
      delivery: { name: contactName.trim(), phone: contactPhone.trim(), address: pickup ? 'Store pick-up' : (address?.line1 ?? ''), city },
    });
    if ('error' in result) {
      setFailure(result.error);
      return;
    }
    track('reservation_placed', { shops: new Set(items.map((i) => i.product.vendorId)).size, items: items.length });
    setPlaced(true);
    useCartStore.getState().clear();
    useCheckoutStore.getState().reset();
    // Leave Cart, Checkout and Review behind, so Back from the confirmation never returns to them.
    router.dismissAll();
    router.push(`/order/${result.id}`);
  };

  // Which line failed, so the message can name it: "Elegant Gown (M, Black): only 1 left".
  const failedItem = failure && 'variantId' in failure ? items.find((i) => i.id === failure.variantId) : undefined;

  return (
    <FlowScreen
      title={PAYMENTS_ENABLED ? 'Review Order' : 'Review Reservation'}
      subtitle={PAYMENTS_ENABLED ? undefined : RESERVE_NOTE}
      cta={{ label: place.isPending ? (PAYMENTS_ENABLED ? 'Placing order…' : 'Reserving…') : PAYMENTS_ENABLED ? 'Proceed to Payment' : 'Reserve', onPress: () => void placeOrder(), disabled: missingAddress || place.isPending }}>
      {failure ? (
        <View accessibilityRole="alert" className="gap-2 rounded-lg border border-danger p-3">
          <Text weight="medium">
            {failure.kind === 'out_of_stock' || failure.kind === 'unavailable'
              ? failedItem
                ? `${failedItem.product.name} (${failedItem.size}, ${failedItem.color}) ${failure.kind === 'out_of_stock' ? 'is short on stock' : 'is no longer for sale'}.`
                : 'An item in your cart is no longer available.'
              : 'Your order was not placed.'}
          </Text>
          <Text>{failure.message}</Text>
          {failure.kind !== 'other' ? <Button label="Update my cart" variant="secondary" fullWidth={false} onPress={() => router.navigate('/cart')} /> : null}
        </View>
      ) : null}
      <View className="gap-2">
        <SectionHeader label="Items" onEdit={() => router.navigate('/cart')} />
        {items.map((item) => (
          <ItemRow key={item.id} item={item} showQty />
        ))}
      </View>

      <View className="gap-4">
        <SectionHeader
          label={delivery === 'delivery' ? 'Delivery address' : 'Delivery method'}
          onEdit={delivery === 'delivery' ? () => setSheetOpen(true) : () => router.back()}
        />
        <View accessible className="flex-row items-start gap-2.5">
          <IconBadge />
          <Text className="flex-1 text-muted">
            {delivery === 'pickup' ? 'Store pick-up' : (address?.line1 ?? 'No address chosen')}
          </Text>
        </View>
        {missingAddress ? (
          <Text accessibilityRole="alert" className="text-xs text-danger">
            Choose a delivery address to place your order.
          </Text>
        ) : null}
      </View>

      {PAYMENTS_ENABLED ? (
      <View className="gap-4">
        <Text weight="medium">Payment</Text>
        <View accessible className="flex-row items-start gap-2.5">
          <IconBadge name="creditCard" />
          <Text className="text-muted">
            {payment === 'transfer' ? 'Bank Transfer' : card ? `${card.brand}  xxxx-xxxx-xxxx-${card.last4}` : 'Card'}
          </Text>
        </View>
      </View>
      ) : null}

      <AddressSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </FlowScreen>
  );
}

/** Heading with a blue underlined "Edit" link (Figma 318:4393). The link gets a 44pt tap target. */
function SectionHeader({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text weight="medium">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label.toLowerCase()}`}
        hitSlop={{ top: 14, bottom: 14, left: 12, right: 0 }}
        onPress={onEdit}>
        <Text weight="medium" className="text-xs text-interactive underline">
          Edit
        </Text>
      </Pressable>
    </View>
  );
}
