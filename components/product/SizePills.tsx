import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import type { Size } from '@/lib/types';

export type SizePillsProps = {
  sizes: Size[];
  roomy?: boolean;
  /** Pass `onSelect` to make the pills a size picker (product page). Without it they are read-only. */
  selected?: Size | null;
  onSelect?: (size: Size) => void;
};

/**
 * Pills for the sizes in stock. Read-only by default (Home, RackGPT), so the 44pt target rule does not apply.
 * With `onSelect` each pill sits in a 44pt tap target and works as a radio group.
 */
export function SizePills({ sizes, roomy = false, selected = null, onSelect }: SizePillsProps) {
  if (onSelect) {
    return (
      <View accessibilityRole="radiogroup" accessibilityLabel="Select size" className="flex-row flex-wrap">
        {sizes.map((s) => {
          const on = s === selected;
          return (
            <Pressable
              key={s}
              accessibilityRole="radio"
              accessibilityLabel={`Size ${s}`}
              accessibilityState={{ checked: on }}
              onPress={() => onSelect(s)}
              className="min-h-11 min-w-11 items-center justify-center">
              <View accessible={false} className={`rounded-sm px-2 py-1.5 ${on ? 'bg-primary' : 'bg-strong'}`}>
                <Text className={`text-xs ${on ? 'text-inverse' : 'text-primary-hover'}`}>{s}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

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
