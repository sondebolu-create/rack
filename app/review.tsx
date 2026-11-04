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
import { useOrdersStore } from '@/lib/orders';

/** M8 Review Order. Figma 318:4386. "Proceed to Payment" places a local order: payment is mock until Paystack. */
export default function Review() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const { delivery, payment, card } = useCheckoutStore();
  const address = useSelectedAddress();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Set once the order is placed, so the emptied cart does not flash an empty state while the screen leaves.
  const [placed, setPlaced] = useState(false);

  if (items.length === 0) {
    if (placed) return null;
    return (
      <FlowScreen title="Review Order">
        <Text>Your cart is empty.</Text>
      </FlowScreen>
    );
  }

  const missingAddress = delivery === 'delivery' && address === null;

  const placeOrder = () => {
    if (missingAddress) return;
    const order = useOrdersStore.getState().place({
      items,
      delivery,
      address: delivery === 'delivery' ? address : null,
      payment,
      card: payment === 'card' ? card : null,
    });
    setPlaced(true);
    useCartStore.getState().clear();
    useCheckoutStore.getState().reset();
    // Leave Cart, Checkout and Review behind, so Back from the confirmation never returns to them.
    router.dismissAll();
    router.push(`/order/${order.id}`);
  };

  return (
    <FlowScreen
      title="Review Order"
      cta={{ label: 'Proceed to Payment', onPress: placeOrder, disabled: missingAddress }}>
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

      <View className="gap-4">
        <Text weight="medium">Payment</Text>
        <View accessible className="flex-row items-start gap-2.5">
          <IconBadge name="creditCard" />
          <Text className="text-muted">
            {payment === 'transfer' ? 'Bank Transfer' : card ? `${card.brand}  xxxx-xxxx-xxxx-${card.last4}` : 'Card'}
          </Text>
        </View>
      </View>

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
