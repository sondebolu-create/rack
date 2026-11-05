import { View } from 'react-native';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';

/** "About Us" sheet. There is no Figma frame for it yet, so it only shows what the mock data knows. */
export function AboutSheet({
  visible,
  vendorName,
  itemCount,
  onClose,
}: {
  visible: boolean;
  vendorName: string;
  itemCount: number;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} title={`About ${vendorName}`} onClose={onClose}>
      <View className="gap-2 pb-6">
        <Text className="text-center text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in this store
        </Text>
      </View>
    </Sheet>
  );
}
