import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { AskRackgptPill } from '@/components/home/AskRackgptPill';
import { ExploreCard } from '@/components/home/ExploreCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionTitle } from '@/components/home/SectionTitle';
import { SponsoredHero } from '@/components/home/SponsoredHero';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useCartCount } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import { useProfile } from '@/lib/queries/profile';
import { useExploreProducts, useNearbyProducts, useSearchProducts, useSponsoredLook } from '@/lib/queries/products';
import { useDebounced } from '@/lib/useDebounced';

/** M2 Home. Figma 318:3193. Reads featured, nearby and recent products from Supabase. */
export default function Home() {
  const cartCount = useCartCount();
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 300);
  const searching = debounced.trim().length >= 2;
  return (
    <View className="flex-1 bg-surface">
      <Screen scroll accessibilityLabel="Home">
        <View className="gap-6 pb-16 pt-3">
          <HomeHeader cartHasItems={cartCount > 0} query={query} onQueryChange={setQuery} />
          {searching ? <SearchResults text={debounced} /> : <Feed />}
        </View>
      </Screen>
      <AskRackgptPill />
    </View>
  );
}

function SearchResults({ text }: { text: string }) {
  const search = useSearchProducts(text);
  return (
    <View className="gap-3">
      <SectionTitle label={`Results for “${text.trim()}”`} />
      <QueryState
        isLoading={search.isLoading}
        isError={search.isError}
        onRetry={() => void search.refetch()}
        isEmpty={(search.data ?? []).length === 0}
        emptyText="No products match your search."
        skeleton={<GridSkeleton />}>
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {(search.data ?? []).map((p) => (
            <ProductCard key={p.id} product={p} className="w-[48.5%]" />
          ))}
        </View>
      </QueryState>
    </View>
  );
}

function GridSkeleton() {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3.5">
      {[0, 1, 2, 3].map((i) => (
        <ProductCardSkeleton key={i} className="w-[48.5%]" />
      ))}
    </View>
  );
}

function Feed() {
  const signedIn = useAuthStore((s) => !!s.session);
  const profile = useProfile();
  // Signed in with a city on file: shops in that city. Guests, and people with no city yet, see every city.
  const city = signedIn ? (profile.data?.city?.trim() || null) : null;
  const sponsored = useSponsoredLook();
  const nearby = useNearbyProducts(city);
  const explore = useExploreProducts();

  return (
    <>
      {sponsored.isLoading ? (
        <View className="flex-row gap-3">
          <Skeleton className="aspect-square flex-1 rounded-xl" />
          <Skeleton className="h-40 w-[100px]" />
        </View>
      ) : sponsored.data ? (
        <SponsoredHero look={sponsored.data} />
      ) : null}

      <View className="gap-2">
        <SectionTitle label="From stores near you" icon="sparkleMuted" />
        <QueryState
          isLoading={nearby.isLoading || (signedIn && profile.isLoading)}
          isError={nearby.isError}
          onRetry={() => void nearby.refetch()}
          isEmpty={(nearby.data ?? []).length === 0}
          emptyText={city ? `No stores in ${city} yet.` : 'No products yet. Check back soon.'}
          skeleton={
            <View className="-mx-4 flex-row gap-3.5 px-4">
              <ProductCardSkeleton className="w-[166px]" />
              <ProductCardSkeleton className="w-[166px]" />
            </View>
          }>
          {/* Bleeds to the screen edge so the next card peeks in. */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearby.data}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => <ProductCard product={item} className="w-[166px]" />}
            className="-mx-4"
            contentContainerClassName="gap-3.5 px-4"
          />
        </QueryState>
      </View>

      <View className="gap-4">
        <SectionTitle label="Explore" />
        <QueryState
          isLoading={explore.isLoading}
          isError={explore.isError}
          onRetry={() => void explore.refetch()}
          isEmpty={(explore.data ?? []).length === 0}
          emptyText="Nothing to explore yet."
          skeleton={<Skeleton className="h-[200px] w-full rounded-md" />}>
          {(explore.data ?? []).map((tile, i) => (
            <ExploreCard key={tile.id} tile={tile} flip={i % 2 === 1} />
          ))}
        </QueryState>
      </View>
    </>
  );
}
