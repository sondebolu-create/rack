import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { MAX_QTY, useCartStore, type CartItem } from '@/lib/cart';
import { ItemRow } from './ItemRow';

/** A cart line with a quantity stepper and Remove (Figma 318:4269). Both talk to the cart store directly. */
export function CartLine({ item }: { item: CartItem }) {
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const atMin = item.qty <= 1;
  const atMax = item.qty >= MAX_QTY;

  return (
    <ItemRow
      item={item}
      right={
        <View className="items-end justify-between self-stretch">
          <View className="flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              accessibilityState={{ disabled: atMin }}
              disabled={atMin}
              onPress={() => setQty(item.id, item.qty - 1)}
              className={`h-11 w-11 items-center justify-center ${atMin ? 'opacity-40' : ''}`}>
              <Icon name="minusCircleDark" size={22} />
            </Pressable>
            <Text
              accessibilityLabel={`Quantity ${item.qty}`}
              accessibilityLiveRegion="polite"
              className="min-w-4 text-center text-base">
              {item.qty}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              accessibilityState={{ disabled: atMax }}
              disabled={atMax}
              onPress={() => setQty(item.id, item.qty + 1)}
              className={`h-11 w-11 items-center justify-center ${atMax ? 'opacity-40' : ''}`}>
              <Icon name="plusCircleDark" size={22} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.product.name}`}
            hitSlop={{ top: 14, bottom: 14, left: 12, right: 12 }}
            onPress={() => remove(item.id)}
            className="mr-2">
            <Text className="text-xs text-danger underline">Remove</Text>
          </Pressable>
        </View>
      }
    />
  );
}
