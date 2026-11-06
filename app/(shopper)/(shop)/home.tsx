import { FlatList, View } from 'react-native';
import { AskRackgptPill } from '@/components/home/AskRackgptPill';
import { ExploreCard } from '@/components/home/ExploreCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionTitle } from '@/components/home/SectionTitle';
import { SponsoredHero } from '@/components/home/SponsoredHero';
import { Screen } from '@/components/ui/Screen';
import { useCartCount } from '@/lib/cart';
import { exploreTiles, nearbyProducts, sponsoredLook } from '@/lib/mock/home';

/** M2 Home. Figma 318:3193. Data is mock until the catalogue schema exists. */
export default function Home() {
  const cartCount = useCartCount();
  return (
    <View className="flex-1 bg-surface">
      <Screen scroll accessibilityLabel="Home">
        <View className="gap-6 pb-16 pt-3">
          <HomeHeader cartHasItems={cartCount > 0} />
          <SponsoredHero look={sponsoredLook} />

          <View className="gap-2">
            <SectionTitle label="From stores near you" icon="sparkleMuted" />
            {/* Bleeds to the screen edge so the next card peeks in. */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={nearbyProducts}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => <ProductCard product={item} className="w-[166px]" />}
              className="-mx-4"
              contentContainerClassName="gap-3.5 px-4"
            />
          </View>

          <View className="gap-4">
            <SectionTitle label="Explore" />
            {exploreTiles.map((tile, i) => (
              <ExploreCard key={tile.id} tile={tile} flip={i % 2 === 1} />
            ))}
          </View>
        </View>
      </Screen>
      <AskRackgptPill />
    </View>
  );
}
