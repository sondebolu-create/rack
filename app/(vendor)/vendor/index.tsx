import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { LowStockRow, Section, SetupChecklist, StatCard } from '@/components/vendor/DashboardParts';
import { OrderRowView, OrderTableHeader } from '@/components/vendor/orders/OrderParts';
import { listFulfillments, loadDashboard, type VendorListItem } from '@/lib/fulfillments';
import { useMyShop, validateShop, type Shop } from '@/lib/shop';
import { colors } from '@/theme';

type Dash = Awaited<ReturnType<typeof loadDashboard>>;

/** Vendor dashboard (V3). A draft shop sees a setup checklist; a live shop sees order counts, low stock and recent orders. */
export default function VendorDashboard() {
  return (
    <Gate need="vendor">
      <VendorShell title="Dashboard">
        <Dashboard />
      </VendorShell>
    </Gate>
  );
}

function Dashboard() {
  const { shop, loading, failed, reload } = useMyShop();
  if (loading) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;
  if (failed || !shop) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className={failed ? 'text-danger' : ''}>
          {failed ? 'Could not load your shop.' : 'Your shop is created when your application is approved.'}
        </Text>
        {failed ? <Button variant="secondary" fullWidth={false} label="Try again" onPress={reload} /> : null}
      </View>
    );
  }
  return <ShopDashboard shop={shop} refreshShop={reload} />;
}

function ShopDashboard({ shop, refreshShop }: { shop: Shop; refreshShop: () => Promise<void> }) {
  const router = useRouter();
  const [dash, setDash] = useState<Dash | null>(null);
  const [recent, setRecent] = useState<VendorListItem[]>([]);
  const [failed, setFailed] = useState(false);
  const live = shop.status === 'live';

  // Refreshes whenever the dashboard comes into focus, so new orders and stock changes show up.
  const load = useCallback(() => {
    let on = true;
    void refreshShop();
    void Promise.all([loadDashboard(shop.id), listFulfillments()])
      .then(([d, o]) => {
        if (!on) return;
        setDash(d);
        setRecent((o.data ?? []).slice(0, 5));
        setFailed(false);
      })
      .catch(() => on && setFailed(true));
    return () => {
      on = false;
    };
    // refreshShop is stable (useCallback in useMyShop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop.id]);
  useFocusEffect(load);

  if (failed) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className="text-danger">
          Could not load the dashboard.
        </Text>
        <Button variant="secondary" fullWidth={false} label="Try again" onPress={load} />
      </View>
    );
  }
  if (!dash) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;

  if (!live) {
    const detailsDone = Object.keys(validateShop(shop)).length === 0;
    return (
      <View className="w-full max-w-[640px] gap-4">
        <Text className="text-primary-hover">Your shop is a draft. Finish these steps so shoppers can find it.</Text>
        <SetupChecklist
          items={[
            { label: 'Add your shop details', hint: 'Name, address, city and categories.', done: detailsDone, onPress: () => router.push('/vendor/shop') },
            { label: 'Add your first product', hint: 'Publish it so there is something to sell.', done: dash.published > 0, onPress: () => router.push(dash.anyProduct ? '/vendor/products' : '/vendor/products/new') },
            { label: 'Publish your shop', hint: 'Needs the two steps above.', done: false, onPress: () => router.push('/vendor/shop?step=3') },
          ]}
        />
      </View>
    );
  }

  return (
    <View className="w-full max-w-[960px] gap-8">
      <View className="flex-row flex-wrap gap-3">
        <StatCard label="New reservations" value={dash.reserved} onPress={() => router.push('/vendor/orders')} />
        <StatCard label="To ship" value={dash.confirmed} onPress={() => router.push('/vendor/orders')} />
        <StatCard label="Delivered this week" value={dash.delivered} onPress={() => router.push('/vendor/orders')} />
      </View>

      <Section title="Low stock">
        {dash.lowStock.length === 0 ? (
          <Text className="text-primary-hover">Nothing is running low.</Text>
        ) : (
          <View className="gap-2">
            {dash.lowStock.map((v) => (
              <LowStockRow
                key={v.id}
                name={v.products.name}
                size={v.size}
                colour={v.colour_name}
                stock={v.stock}
                onEdit={() => router.push(`/vendor/products/${v.products.id}`)}
              />
            ))}
          </View>
        )}
      </Section>

      <Section title="Recent orders" action={recent.length ? { label: 'View all', onPress: () => router.push('/vendor/orders') } : undefined}>
        {recent.length === 0 ? (
          <Text className="text-primary-hover">No orders yet.</Text>
        ) : (
          <View className="gap-3 lg:gap-0">
            <OrderTableHeader />
            {recent.map((r) => (
              <OrderRowView key={r.id} item={r} onOpen={() => router.push(`/vendor/orders/${r.id}`)} />
            ))}
          </View>
        )}
      </Section>
    </View>
  );
}
