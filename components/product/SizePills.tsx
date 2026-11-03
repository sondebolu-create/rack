import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import type { Size } from '@/lib/types';

/** Read-only pills for the sizes in stock. Not tappable, so the 44pt target rule does not apply. */
export function SizePills({ sizes, roomy = false }: { sizes: Size[]; roomy?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`Available sizes: ${sizes.join(', ')}`}
      className="flex-row flex-wrap gap-1">
      {sizes.map((s) => (
        <View
          key={s}
          accessible={false}
          className={`bg-strong ${roomy ? 'rounded-md px-2 py-0.5' : 'rounded-sm px-1'}`}>
          <Text className="text-[10px] leading-4 text-primary-hover">{s}</Text>
        </View>
      ))}
    </View>
  );
}
