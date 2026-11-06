import { Tabs } from 'expo-router';

export default function ShopLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#09090b',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontFamily: 'CabinetGrotesk-Medium', fontSize: 12 },
        tabBarIconStyle: { display: 'none' },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarStyle: { borderTopColor: '#e4e4e7' },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="rackgpt" options={{ title: 'RackGPT' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
    </Tabs>
  );
}
