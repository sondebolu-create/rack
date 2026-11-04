import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';

/**
 * Four white corner brackets around a 345 x 388 viewfinder (Figma 318:4681, 318:4736).
 * Figma draws one bracket and rotates it, so this does too. The brackets sit on top of `children`.
 */
export function Corners({ children }: { children?: React.ReactNode }) {
  return (
    <View className="flex-1">
      {children}
      <View pointerEvents="none" accessible={false} className="absolute inset-0">
        <View className="absolute left-0 top-0">
          <Icon name="corner" size={31} />
        </View>
        <View className="absolute right-0 top-0 rotate-90">
          <Icon name="corner" size={31} />
        </View>
        <View className="absolute bottom-0 right-0 rotate-180">
          <Icon name="corner" size={31} />
        </View>
        <View className="absolute bottom-0 left-0 -rotate-90">
          <Icon name="corner" size={31} />
        </View>
      </View>
    </View>
  );
}
