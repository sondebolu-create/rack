import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SIZES, type Size } from '@/lib/types';

/** Read-only size availability: every size in the enum, in-stock ones dark, the rest faded. */
export function SizeRow({ available }: { available: Size[] }) {
  return (
    <View
      accessible
      accessibilityLabel={`Sizes in stock: ${available.length ? available.join(', ') : 'none'}`}
      className="flex-row items-center gap-px">
      {SIZES.map((s) => (
        <Text
          key={s}
          accessible={false}
          className={`text-xs lowercase ${available.includes(s) ? 'text-primary-hover' : 'text-disabled'}`}>
          {s}
        </Text>
      ))}
    </View>
  );
}
