import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SidebarLayout } from '@/components/ui/SidebarLayout';
import { Text } from '@/components/ui/Text';
import { usePageTitle } from '@/lib/usePageTitle';

/** Dev-only demo of SidebarLayout. Resize past 1024px to see the sidebar appear. */
export default function ShellDemo() {
  usePageTitle('Layout demo');
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <SidebarLayout
        topBar={
          <View className="px-4 py-3">
            <Text weight="medium">Rack vendor (top bar below 1024px)</Text>
          </View>
        }
        sidebar={
          <View className="gap-3 p-4">
            <Text weight="medium" className="text-lg">
              Rack vendor
            </Text>
            <Text>Listings</Text>
            <Text>Orders</Text>
            <Text>Store</Text>
          </View>
        }>
        <ScrollView contentContainerClassName="gap-4 p-4">
          <Text weight="medium" accessibilityRole="header" className="text-xl">
            Content area
          </Text>
          <Text className="text-primary-hover">Sidebar and content at 1024px and wider; one column below.</Text>
        </ScrollView>
      </SidebarLayout>
    </SafeAreaView>
  );
}
