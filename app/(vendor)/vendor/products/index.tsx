import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Text } from '@/components/ui/Text';
import { ProductRowView, ProductTableHeader, StatusFilterChips } from '@/components/vendor/products/ProductRows';
import { duplicateProduct, listMyProducts, setProductStatus, type ListedProduct, type ProductStatus } from '@/lib/products';
import { useMyShop } from '@/lib/shop';
import { colors } from '@/theme';

export default function VendorProducts() {
  return (
    <Gate need="vendor">
      <VendorShell title="Products">
        <ProductList />
      </VendorShell>
    </Gate>
  );
}

function ProductList() {
  const router = useRouter();
  const { shop, loading: shopLoading } = useMyShop();
  const [rows, setRows] = useState<ListedProduct[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>();
  const [nonce, setNonce] = useState(0);
  const shopId = shop?.id;

  useEffect(() => {
    if (!shopId) return;
    let live = true;
    void listMyProducts(shopId).then(({ data, error }) => {
      if (!live) return;
      if (error || !data) setFailed(true);
      else setRows(data);
    });
    return () => {
      live = false;
    };
  }, [shopId, nonce]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((p) => (filter === 'all' || p.status === filter) && (!q || p.name.toLowerCase().includes(q)));
  }, [rows, filter, query]);

  const act = async (p: ListedProduct, run: () => Promise<{ error?: string }>) => {
    setBusyId(p.id);
    setMessage(undefined);
    const r = await run();
    if (r.error) setMessage(`${p.name}: ${r.error}`);
    else setNonce((n) => n + 1);
    setBusyId(null);
  };

  if (shopLoading || (shop && rows === null && !failed)) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;
  if (!shop) return <Text>Your shop is created when your application is approved.</Text>;
  if (failed) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className="text-danger">
          Could not load your products.
        </Text>
        <Button variant="secondary" fullWidth={false} label="Try again" onPress={() => { setFailed(false); setNonce((n) => n + 1); }} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap items-center gap-3">
        <Button fullWidth={false} arrow label="Add product" onPress={() => router.push('/vendor/products/new')} />
        {shop.status !== 'live' ? (
          <Text className="flex-1 text-xs text-primary-hover">Your shop is a draft. Shoppers see these once you publish the shop.</Text>
        ) : null}
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search your products" className="max-w-[480px]" />
      <StatusFilterChips value={filter} onChange={setFilter} />
      {message ? (
        <Text accessibilityRole="alert" className="text-danger">
          {message}
        </Text>
      ) : null}
      {visible.length === 0 ? (
        <Text className="text-primary-hover">{rows?.length ? 'No products match.' : 'No products yet. Add your first one.'}</Text>
      ) : (
        <View className="gap-3 lg:gap-0">
          <ProductTableHeader />
          {visible.map((p) => (
            <ProductRowView
              key={p.id}
              product={p}
              busy={busyId === p.id}
              actions={{
                onEdit: () => router.push(`/vendor/products/${p.id}`),
                onDuplicate: () => void act(p, () => duplicateProduct(p)),
                onTogglePublish: () => void act(p, () => setProductStatus(p.id, p.status === 'published' ? 'draft' : 'published')),
                onArchive: () => void act(p, () => setProductStatus(p.id, p.status === 'archived' ? 'draft' : 'archived')),
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
