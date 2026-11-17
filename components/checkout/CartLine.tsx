import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { maxQtyFor, useCartStore, type CartItem } from '@/lib/cart';
import type { LineCheck } from '@/lib/queries/cart';
import { ItemRow } from './ItemRow';

/** A cart line with a quantity stepper and Remove (Figma 318:4269). Both talk to the cart store directly. */
export function CartLine({ item, check }: { item: CartItem; check?: LineCheck }) {
  const dismiss = useCartStore((s) => s.dismissNotice);
  const gone = check?.state === 'sold_out' || check?.state === 'unavailable';
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const atMin = item.qty <= 1;
  const atMax = item.qty >= maxQtyFor(item);
  const flag = check?.state === 'sold_out' ? 'Sold out.' : check?.state === 'unavailable' ? 'No longer available.' : null;

  return (
    <View className={`gap-1 ${gone ? 'opacity-90' : ''}`}>
    <ItemRow
      item={item}
      right={
        <View className="items-end justify-between self-stretch">
          <View className="flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              accessibilityState={{ disabled: atMin }}
              disabled={atMin || gone}
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
              disabled={atMax || gone}
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
    {flag ? (
      <Text accessibilityRole="alert" weight="medium" className="px-2 text-xs">
        {flag} Remove it to continue.
      </Text>
    ) : null}
    {item.notice ? (
      <View className="flex-row items-center justify-between gap-2 px-2">
        <Text accessibilityRole="alert" className="flex-1 text-xs">
          {item.notice}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notice" onPress={() => dismiss(item.id)} className="min-h-11 justify-center">
          <Text weight="medium" className="text-xs underline">
            OK
          </Text>
        </Pressable>
      </View>
    ) : null}
    </View>
  );
}
