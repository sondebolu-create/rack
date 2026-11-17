import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { AskRackgptPill } from '@/components/home/AskRackgptPill';
import { ProductCard } from '@/components/home/ProductCard';
import { AboutSheet } from '@/components/store/AboutSheet';
import { CategoryTabs } from '@/components/store/CategoryTabs';
import { GenderToggle } from '@/components/store/GenderToggle';
import { BackHeader } from '@/components/ui/BackHeader';
import { Screen } from '@/components/ui/Screen';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useDebounced } from '@/lib/useDebounced';
import { SearchBar } from '@/components/ui/SearchBar';
import { Text } from '@/components/ui/Text';
import { STORE_CATEGORIES, type GenderFilter, type StoreCategory, type StoreProduct } from '@/lib/categories';

export type BrandStoreProps = {
  name: string;
  products: StoreProduct[];
  /** Tabs, "All" first. Defaults to the full set. */
  categories?: StoreCategory[];
  /** A women-only or men-only shop has no gender toggle. Defaults to both. */
  genderFocus?: 'women' | 'men' | 'both';
  about?: { description?: string | null; city?: string | null; logoUrl?: string | null; bannerUrl?: string | null };
  /** Inside the vendor's shop preview: no Back link, no floating Rackgpt button, no browser tab title, no safe-area inset. */
  embedded?: boolean;
  /** The list was already filtered by category, gender and name on the server: show it as it is. */
  serverFiltered?: boolean;
  /** Told whenever the category, gender or (debounced) search text changes, so the parent can query for it. */
  onFiltersChange?: (f: { category: string; gender: GenderFilter; query: string }) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

/** "All" plus the tabs for the given category ids, in the standard order. */
export function categoriesFor(ids: string[]): StoreCategory[] {
  return STORE_CATEGORIES.filter((c) => c.id === 'all' || ids.includes(c.id));
}

/**
 * M3 Brand store. Figma 318:3770 (both genders), 318:3874 (women) and 318:3971 (men): one screen,
 * where the gender toggles and the category tabs filter the same product grid.
 * Used by the shopper route (app/(shopper)/store/[id]) AND by the vendor's shop preview, so the preview is the real thing.
 */
export function BrandStore({
  name,
  products,
  categories = STORE_CATEGORIES,
  genderFocus = 'both',
  about,
  embedded = false,
  serverFiltered = false,
  onFiltersChange,
  loading = false,
  error = false,
  onRetry,
}: BrandStoreProps) {
  const [category, setCategory] = useState('all');
  const [gender, setGender] = useState<GenderFilter>(genderFocus === 'both' ? 'all' : genderFocus);
  const [query, setQuery] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const debouncedQuery = useDebounced(query, 300);
  useEffect(() => {
    onFiltersChange?.({ category, gender, query: debouncedQuery });
    // The parent's callback is a state setter; the filters are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, gender, debouncedQuery]);
  const visible = useMemo(
    () =>
      serverFiltered
        ? products
        : products.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          (gender === 'all' || p.gender === 'both' || p.gender === gender) &&
          (q === '' || p.name.toLowerCase().includes(q)),
      ),
    [products, category, gender, q, serverFiltered],
  );
  // Pad an odd count so the last card keeps a column's width instead of stretching.
  const data: (StoreProduct | null)[] = visible.length % 2 === 1 ? [...visible, null] : visible;
  const categoryLabel = categories.find((c) => c.id === category)?.label ?? '';

  const body = (
    <>
      <View className="gap-4 pb-2">
        <BackHeader
          title={name}
          back={!embedded}
          right={genderFocus === 'both' ? <GenderToggle value={gender} onChange={setGender} /> : undefined}
          below={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`About ${name}`}
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
        <CategoryTabs categories={categories} selected={category} onSelect={setCategory} />
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
          loading ? (
            <View accessibilityLabel="Loading" className="flex-row gap-3.5">
              <ProductCardSkeleton className="flex-1" />
              <ProductCardSkeleton className="flex-1" />
            </View>
          ) : error ? (
            <View className="items-start gap-3 pt-4">
              <Text accessibilityRole="alert" className="text-danger">
                Could not load this store’s products.
              </Text>
              {onRetry ? <Button variant="secondary" fullWidth={false} label="Retry" onPress={onRetry} /> : null}
            </View>
          ) : (
            <Text accessibilityLiveRegion="polite" className="pt-6 text-center text-muted">
              {q ? 'No items match your search.' : category === 'all' ? 'Nothing here yet.' : `Nothing in ${categoryLabel} yet.`}
            </Text>
          )
        }
      />
    </>
  );

  return (
    <View className="flex-1 bg-surface">
      {embedded ? <View className="flex-1 px-4 pt-3">{body}</View> : <Screen accessibilityLabel={name}>{body}</Screen>}
      {embedded ? null : <AskRackgptPill />}
      <AboutSheet
        visible={aboutOpen}
        vendorName={name}
        itemCount={products.length}
        description={about?.description}
        city={about?.city}
        logoUrl={about?.logoUrl}
        bannerUrl={about?.bannerUrl}
        onClose={() => setAboutOpen(false)}
      />
    </View>
  );
}
