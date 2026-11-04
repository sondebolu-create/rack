import { View } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';

/** 20pt grey rounded badge with a small icon: map pin for addresses, credit card for payment (Figma 318:4373). */
export function IconBadge({ name = 'mapPin' }: { name?: IconName }) {
  return (
    <View accessible={false} className="h-5 w-5 items-center justify-center rounded-lg bg-card">
      <Icon name={name} size={10} />
    </View>
  );
}
