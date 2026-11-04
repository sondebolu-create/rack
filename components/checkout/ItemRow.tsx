import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { CartItem } from '@/lib/cart';
import { formatPrice } from '@/lib/format';

export type ItemRowProps = {
  item: CartItem;
  /** Controls on the right, such as the stepper and Remove in the cart. */
  right?: ReactNode;
  /** Adds "× qty" after the price (Review and Confirmed show no stepper). */
  showQty?: boolean;
};

/** Grey card for one cart line: photo, store, name, size, price (Figma 318:4269, 318:4396). */
export function ItemRow({ item, right, showQty = false }: ItemRowProps) {
  const router = useRouter();
  const { product } = item;
  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-card p-2">
      <Image
        source={product.image}
        accessibilityLabel={product.imageAlt}
        contentFit="cover"
        className="h-[67px] w-[63px] rounded-xl"
      />
      <View className="flex-1 gap-1.5">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${product.vendorName} store`}
          hitSlop={{ top: 14, bottom: 6, left: 8, right: 24 }}
          onPress={() => router.push(`/store/${product.vendorId}`)}
          className="self-start">
          {/* primary-hover, not muted: muted fails contrast on the grey card. */}
          <Text weight="medium" className="text-xs text-primary-hover underline">
            {product.vendorName}
          </Text>
        </Pressable>
        <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Text weight="medium">{product.name}</Text>
          <View accessible accessibilityLabel={`Size ${item.size}`} className="rounded-sm bg-strong px-1">
            <Text className="text-[10px] leading-4 text-primary-hover">{item.size}</Text>
          </View>
          <Text accessibilityLabel={`Colour ${item.color}`} className="text-xs text-primary-hover">
            {item.color}
          </Text>
        </View>
        <Text weight="medium" className="text-xs">
          {formatPrice(product.priceMinor, product.currency)}
          {showQty ? `  × ${item.qty}` : ''}
        </Text>
      </View>
      {right}
    </View>
  );
}
