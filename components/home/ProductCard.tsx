import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';
import type { ProductCardData } from '@/lib/types';

/** Grey card with a square photo, brand, name and price. Opens the product page. */
export function ProductCard({
  product,
  className = '',
  onGrey = false,
}: {
  product: ProductCardData;
  className?: string;
  /** Set when the card sits on a grey (`bg-card`) section, so it turns white to stay visible. */
  onGrey?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name} by ${product.vendorName}, ${formatPrice(product.priceMinor, product.currency)}`}
      onPress={() => router.push(`/product/${product.id}`)}
      className={`gap-1.5 rounded-md border border-line p-2 ${onGrey ? 'bg-surface' : 'bg-card'} ${className}`}>
      <Image
        source={product.image}
        accessibilityLabel={product.imageAlt}
        contentFit="cover"
        className="aspect-square w-full rounded-xl"
      />
      <View className="gap-1">
        <Text className="text-xs">{product.vendorName}</Text>
        <Text weight="medium">{product.name}</Text>
        <Text weight="medium" className="text-xs">
          {formatPrice(product.priceMinor, product.currency)}
        </Text>
      </View>
    </Pressable>
  );
}
