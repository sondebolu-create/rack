import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AskRackgptPill } from '@/components/home/AskRackgptPill';
import { ProductCard } from '@/components/home/ProductCard';
import { AboutSheet } from '@/components/store/AboutSheet';
import { CategoryTabs } from '@/components/store/CategoryTabs';
import { GenderToggle } from '@/components/store/GenderToggle';
import { BackHeader } from '@/components/ui/BackHeader';
import { Screen } from '@/components/ui/Screen';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { SearchBar } from '@/components/ui/SearchBar';
import { Text } from '@/components/ui/Text';
import {
  STORE_CATEGORIES,
  getStoreFeed,
  getVendorName,
  type GenderFilter,
  type StoreProduct,
} from '@/lib/mock/store';

export default function Store() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vendorName = getVendorName(id);
  if (!vendorName) return <ScreenPlaceholder name="Brand not found" req="M3" back />;
  return <StoreView vendorId={id} vendorName={vendorName} />;
}

/**
 * M3 Brand store. Figma 318:3770 (both genders), 318:3874 (women) and 318:3971 (men): one screen,
 * where the gender toggles and the category tabs filter the same product grid.
 */
function StoreView({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const feed = useMemo(() => getStoreFeed(vendorId), [vendorId]);
  const [category, setCategory] = useState('all');
  const [gender, setGender] = useState<GenderFilter>('all');
  const [query, setQuery] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = feed.filter(
    (p) =>
      (category === 'all' || p.category === category) &&
      (gender === 'all' || p.gender === gender) &&
      (q === '' || p.name.toLowerCase().includes(q)),
  );
  // Pad an odd count so the last card keeps a column's width instead of stretching.
  const data: (StoreProduct | null)[] = visible.length % 2 === 1 ? [...visible, null] : visible;
  const categoryLabel = STORE_CATEGORIES.find((c) => c.id === category)?.label ?? '';

  return (
    <View className="flex-1 bg-surface">
      <Screen accessibilityLabel={vendorName}>
        <View className="gap-4 pb-2">
          <BackHeader
            title={vendorName}
            right={<GenderToggle value={gender} onChange={setGender} />}
            below={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`About ${vendorName}`}
                hitSlop={{ top: 8, bottom: 14, right: 24 }}
                onPress={() => setAboutOpen(true)}
                className="self-start">
                <Text weight="medium" className="text-xs text-muted underline">
                  About Us
                </Text>
              </Pressable>
            }
          />
          <SearchBar value={query} onChangeText={setQuery} />
          <CategoryTabs categories={STORE_CATEGORIES} selected={category} onSelect={setCategory} />
        </View>

        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(p, i) => p?.id ?? `pad-${i}`}
          renderItem={({ item }) => (item ? <ProductCard product={item} className="flex-1" /> : <View className="flex-1" />)}
          columnWrapperClassName="gap-3.5"
          contentContainerClassName="gap-3.5 pb-24 pt-3"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text accessibilityLiveRegion="polite" className="pt-6 text-center text-muted">
              {q ? 'No items match your search.' : category === 'all' ? 'Nothing here yet.' : `Nothing in ${categoryLabel} yet.`}
            </Text>
          }
        />
      </Screen>
      <AskRackgptPill />

      <AboutSheet visible={aboutOpen} vendorName={vendorName} itemCount={feed.length} onClose={() => setAboutOpen(false)} />
    </View>
  );
}
