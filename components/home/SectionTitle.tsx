import { View } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

export function SectionTitle({ label, icon }: { label: string; icon?: IconName }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-muted" accessibilityRole="header">
        {label}
      </Text>
      {icon ? <Icon name={icon} size={12} /> : null}
    </View>
  );
}
