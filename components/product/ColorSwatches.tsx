import { Pressable, View } from 'react-native';
import type { ProductColor } from '@/lib/types';

export type ColorSwatchesProps = {
  colors: ProductColor[];
  selected: string | null;
  onSelect: (name: string) => void;
};

/** Round colour pickers. Each is a 24pt dot with a ring when chosen, inside a 44pt tap target. */
export function ColorSwatches({ colors, selected, onSelect }: ColorSwatchesProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Select color" className="flex-row">
      {colors.map((c) => {
        const on = c.name === selected;
        return (
          <Pressable
            key={c.name}
            accessibilityRole="radio"
            accessibilityLabel={c.name}
            accessibilityState={{ checked: on }}
            onPress={() => onSelect(c.name)}
            className="h-11 w-11 items-center justify-center">
            <View
              accessible={false}
              className={`h-8 w-8 items-center justify-center rounded-full border-2 ${on ? 'border-primary' : 'border-transparent'}`}>
              {/* The fill is the product's colour, so it is a dynamic value. */}
              <View className="h-6 w-6 rounded-full border border-line" style={{ backgroundColor: c.hex }} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
