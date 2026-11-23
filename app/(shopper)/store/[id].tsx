import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BrandStore, categoriesFor } from '@/components/store/BrandStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { shopMetadata } from '@/lib/server/share';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { NotFound } from '@/components/ui/NotFound';
import type { GenderFilter } from '@/lib/categories';
import { useShop, useShopProducts, type ShopRow } from '@/lib/queries/products';

/** M3 Brand store route, loaded by slug. The screen itself is components/store/BrandStore (the vendor's preview uses it too). */
/** Share-preview tags (title, description, image) for link crawlers. Runs on the web server for each request. */
export async function generateMetadata(_request: unknown, params: Record<string, string>) {
  return shopMetadata(params.id);
}

export default function Store() {
  return <StoreLoader />;
}

function StoreLoader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shop = useShop(id);
  if (shop.isLoading) {
    return (
      <Screen accessibilityLabel="Loading store">
        <View className="gap-4 pt-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-16 w-full" />
        </View>
      </Screen>
    );
  }
  if (shop.isError) {
    return (
      <Screen back accessibilityLabel="Store">
        <View className="pt-4">
          <QueryState isLoading={false} isError onRetry={() => void shop.refetch()} isEmpty={false} skeleton={null} emptyText="">
            {null}
          </QueryState>
        </View>
      </Screen>
    );
  }
  if (!shop.data) return <NotFound title="Store not found" body="It may have gone offline, or the link is wrong." />;
  return <LiveStore shop={shop.data} />;
}

function LiveStore({ shop }: { shop: ShopRow }) {
  const [filters, setFilters] = useState<{ category: string; gender: GenderFilter; query: string }>({ category: 'all', gender: 'all', query: '' });
  const products = useShopProducts(shop, filters);
  return (
    <BrandStore
      key={shop.id}
      name={shop.name}
      products={products.data ?? []}
      categories={categoriesFor(shop.categories)}
      genderFocus={shop.gender_focus}
      about={{ description: shop.description, city: shop.city, logoUrl: shop.logo_url, bannerUrl: shop.banner_url }}
      // The server already filtered, so the screen shows the list as it is.
      serverFiltered
      onFiltersChange={setFilters}
      loading={products.isLoading}
      error={products.isError}
      onRetry={() => void products.refetch()}
    />
  );
}
