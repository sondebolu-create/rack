import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CartLine } from '@/components/checkout/CartLine';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { TotalsCard } from '@/components/checkout/TotalsCard';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useCartStore, useCartTotals } from '@/lib/cart';

/** M6 Cart. Figma 318:4264. Reads and writes the cart store. */
export default function Cart() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const { count, subtotalMinor, currency } = useCartTotals();

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

  return (
    <FlowScreen
      title="Your Cart"
      subtitle={`${count} ${count === 1 ? 'item' : 'items'}`}
      cta={{ label: 'Proceed', onPress: () => router.push('/checkout') }}>
      <View className="gap-4">
        <View className="gap-3">
          {items.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </View>
        <TotalsCard subtotalMinor={subtotalMinor} currency={currency} />
      </View>
    </FlowScreen>
  );
}
