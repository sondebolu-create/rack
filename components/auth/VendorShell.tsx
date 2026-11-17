import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { usePathname, useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SidebarLayout } from '@/components/ui/SidebarLayout';
import { Text } from '@/components/ui/Text';
import { signOut, useAuthStore } from '@/lib/auth';
import { useNewOrderCount } from '@/lib/fulfillments';
import { usePageTitle } from '@/lib/usePageTitle';

export type NavItem = { label: string; href: Href };

export const VENDOR_LINKS: NavItem[] = [
  { label: 'Dashboard', href: '/vendor' },
  { label: 'Shop', href: '/vendor/shop' },
  { label: 'Products', href: '/vendor/products' },
  { label: 'Orders', href: '/vendor/orders' },
];
export const ADMIN_LINKS: NavItem[] = [{ label: 'Applications', href: '/admin/applications' }];

/** Is this nav item the current page? `/vendor` only matches exactly; the others match their sub-pages too. */
function isActive(pathname: string, href: Href) {
  const h = String(href);
  return h === '/vendor' ? pathname === h : pathname === h || pathname.startsWith(`${h}/`);
}

function NavLink({ label, active, onPress, row, badge }: { label: string; active?: boolean; onPress: () => void; row?: boolean; badge?: number }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={badge ? `${label}, ${badge} new` : label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-md px-3 hover:bg-card active:bg-card ${active ? 'bg-card' : ''} ${row ? 'shrink-0' : ''}`}>
      <View className="flex-row items-center gap-2">
        <Text weight={active ? 'bold' : 'medium'}>{label}</Text>
        {badge ? (
          <View accessible={false} className="min-w-5 items-center rounded-full bg-primary px-1.5">
            <Text weight="medium" className="text-xs text-inverse">
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Frame for the vendor and admin pages (SidebarLayout). From 1024px: a sidebar. Below that: a top bar with the
 * same links in a scrolling row, so every page works on a phone. Links default by role.
 */
export function VendorShell({ title, links, children }: { title: string; links?: NavItem[]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  usePageTitle(title);

  // New-order badge: re-counted whenever a page (re)opens. TODO(notifications): email / push for new orders.
  const newOrders = useNewOrderCount(role === 'vendor', pathname);
  const main = links ?? (role === 'vendor' ? VENDOR_LINKS : role === 'admin' ? ADMIN_LINKS : []);
  const out = async () => {
    await signOut();
    router.replace('/onboarding');
  };
  const items: { label: string; active?: boolean; badge?: number; onPress: () => void }[] = [
    ...main.map((l) => ({
      label: l.label,
      active: isActive(pathname, l.href),
      badge: l.label === 'Orders' ? newOrders : undefined,
      onPress: () => router.navigate(l.href),
    })),
    { label: 'View app', onPress: () => router.navigate('/home') },
    { label: 'Account', onPress: () => router.navigate('/account') },
    { label: 'Sign out', onPress: out },
  ];

  const sidebar = (
    <View className="gap-1 p-4">
      <Text weight="bold" className="mb-2 text-xl">
        Rack
      </Text>
      {items.map((i) => (
        <NavLink key={i.label} {...i} />
      ))}
    </View>
  );

  const topBar = (
    <View className="border-b border-line">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="menu" contentContainerClassName="items-center gap-1 px-4 py-2">
        <Text weight="bold" className="mr-2 text-xl">
          Rack
        </Text>
        {items.map((i) => (
          <NavLink key={i.label} row {...i} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <SidebarLayout sidebar={sidebar} topBar={topBar}>
        <ScrollView contentContainerClassName="gap-4 p-4 lg:p-9">
          <Text weight="bold" accessibilityRole="header" className="text-2xl">
            {title}
          </Text>
          {children}
        </ScrollView>
      </SidebarLayout>
    </SafeAreaView>
  );
}
