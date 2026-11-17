import { useState } from 'react';
import { View } from 'react-native';
import { ProductCard } from '@/components/home/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { QueryState } from '@/components/ui/QueryState';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useSimilarProducts } from '@/lib/queries/products';
import type { ProductDetail } from '@/lib/types';

/** "Similar Products": same category, with the brand switch. A two-column grid of Home's ProductCard. */
export function SimilarProducts({ product }: { product: ProductDetail }) {
  const [otherBrands, setOtherBrands] = useState(false);
  const similar = useSimilarProducts(product, otherBrands);
  const items = similar.data ?? [];

  return (
    <View className="gap-4 rounded-xl bg-card p-4">
      <View className="flex-row flex-wrap items-center justify-between gap-x-4">
        <View className="flex-row items-center gap-2">
          <Text accessibilityRole="header">Similar Products</Text>
          <Icon name="sparkleMuted" size={12} />
        </View>
        <Switch label="Include from other brands" value={otherBrands} onValueChange={setOtherBrands} />
      </View>
      <QueryState
        isLoading={similar.isLoading}
        isError={similar.isError}
        onRetry={() => void similar.refetch()}
        isEmpty={items.length === 0}
        emptyText="No similar products yet."
        skeleton={
          <View className="flex-row justify-between">
            <ProductCardSkeleton className="w-[48.5%]" />
            <ProductCardSkeleton className="w-[48.5%]" />
          </View>
        }>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onGrey className="w-[48.5%]" />
          ))}
        </View>
      </QueryState>
    </View>
  );
}
