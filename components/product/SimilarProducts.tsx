import { useState } from 'react';
import { View } from 'react-native';
import { ProductCard } from '@/components/home/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { getSimilarProducts } from '@/lib/mock/product';
import type { ProductDetail } from '@/lib/types';

/** "Similar Products" with the brand switch and a two-column grid of Home's ProductCard. */
export function SimilarProducts({ product }: { product: ProductDetail }) {
  const [otherBrands, setOtherBrands] = useState(false);
  const items = getSimilarProducts(product, otherBrands);

  return (
    <View className="gap-4 rounded-xl bg-card p-4">
      <View className="flex-row flex-wrap items-center justify-between gap-x-4">
        <View className="flex-row items-center gap-2">
          <Text accessibilityRole="header">Similar Products</Text>
          <Icon name="sparkleMuted" size={12} />
        </View>
        <Switch label="Include from other brands" value={otherBrands} onValueChange={setOtherBrands} />
      </View>
      {items.length ? (
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onGrey className="w-[48.5%]" />
          ))}
        </View>
      ) : (
        <Text className="text-primary-hover">No similar products yet.</Text>
      )}
    </View>
  );
}
