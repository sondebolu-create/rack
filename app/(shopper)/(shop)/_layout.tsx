import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components/ui/Icon';

function tabIcon(name: IconName) {
  // eslint-disable-next-line react/display-name
  return ({ color }: { color: unknown }) => <Icon name={name} size={24} tintColor={String(color)} />;
}

export default function ShopLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#09090b',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontFamily: 'CabinetGrotesk-Medium', fontSize: 12 },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarStyle: { borderTopColor: '#e4e4e7' },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('tabHome') }} />
      <Tabs.Screen name="rackgpt" options={{ title: 'Rack', tabBarIcon: tabIcon('tabRack') }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: tabIcon('tabCart') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('tabSettings') }} />
      {/* Reached from Settings, not the tab bar. */}
      <Tabs.Screen name="orders" options={{ href: null }} />
    </Tabs>
  );
}
