import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CartLine } from '@/components/checkout/CartLine';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { TotalsCard } from '@/components/checkout/TotalsCard';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useCartStore, useCartTotals } from '@/lib/cart';
import { useCartCheck } from '@/lib/queries/cart';

/**
 * M6 Cart. Figma 318:4264. Reads and writes the cart store. Every time it opens, price and stock are re-checked:
 * changed prices and short quantities are fixed and flagged, and sold-out or unavailable lines block checkout.
 */
export default function Cart() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const reconcile = useCartStore((s) => s.reconcile);
  const { count, subtotalMinor, currency } = useCartTotals();
  const check = useCartCheck(items);

  useEffect(() => {
    if (check.data) reconcile(check.data);
  }, [check.data, reconcile]);

  if (items.length === 0) {
    return (
      <FlowScreen title="Your Cart" subtitle="0 items">
        <View className="items-start gap-4 pt-2">
          <Text>Your cart is empty.</Text>
          <Button label="Go to Home" variant="secondary" fullWidth={false} onPress={() => router.navigate('/home')} />
        </View>
      </FlowScreen>
    );
  }

  const checks = check.data ?? {};
  const blocked = items.filter((i) => checks[i.id]?.state === 'sold_out' || checks[i.id]?.state === 'unavailable');

  return (
    <FlowScreen
      title="Your Cart"
      subtitle={`${count} ${count === 1 ? 'item' : 'items'}`}
      cta={{ label: 'Proceed', onPress: () => router.push('/checkout'), disabled: blocked.length > 0 }}>
      <View className="gap-4">
        {check.isError ? (
          <Text accessibilityRole="alert" className="text-xs text-primary-hover">
            Could not check the latest prices and stock. We check again when you place the order.
          </Text>
        ) : null}
        {blocked.length > 0 ? (
          <Text accessibilityRole="alert" weight="medium" className="text-xs">
            Remove the {blocked.length === 1 ? 'item' : 'items'} marked unavailable to continue.
          </Text>
        ) : null}
        <View className="gap-3">
          {items.map((item) => (
            <CartLine key={item.id} item={item} check={checks[item.id]} />
          ))}
        </View>
        <TotalsCard subtotalMinor={subtotalMinor} currency={currency} />
      </View>
    </FlowScreen>
  );
}
