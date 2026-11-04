import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import type { ProductColor, Size } from '@/lib/types';
import { colors } from '@/theme';

/** Rough "is this a light colour" test, to pick a check mark that shows on it. */
function isLight(hex: string): boolean {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

/** Colour dots for the black camera screen (Figma 318:4689): 36pt dots at a 44pt pitch, a check on the chosen one. */
export function DarkColorSwatches({
  colors: options,
  selected,
  onSelect,
}: {
  colors: ProductColor[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Select color" className="flex-row">
      {options.map((c) => {
        const on = c.name === selected;
        return (
          <Pressable
            key={c.name}
            accessibilityRole="radio"
            accessibilityLabel={c.name}
            accessibilityState={{ checked: on }}
            onPress={() => onSelect(c.name)}
            className="h-11 w-11 items-center justify-center">
            {/* The fill is the product's colour, so it is a dynamic value. */}
            <View
              accessible={false}
              className="h-9 w-9 items-center justify-center rounded-full border border-cam-line"
              style={{ backgroundColor: c.hex }}>
              {on ? <Icon name="check" size={12} tintColor={isLight(c.hex) ? colors.ink : colors.inverse} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Size chips for the black camera screen (Figma 318:4699). Each sits in a 44pt tap target. */
export function DarkSizeChips({
  sizes,
  selected,
  onSelect,
}: {
  sizes: Size[];
  selected: Size | null;
  onSelect: (size: Size) => void;
}) {
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
            <View
              accessible={false}
              className={`min-h-[30px] min-w-[25px] items-center justify-center rounded-sm border bg-cam-chip px-2 py-1.5 ${on ? 'border-cam-ring' : 'border-transparent'}`}>
              <Text className="text-xs text-inverse-icon">{s}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
