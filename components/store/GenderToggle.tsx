import { Pressable, View } from 'react-native';
import { Image } from '@/components/ui/Image';
import type { Gender, GenderFilter } from '@/lib/categories';

const SPRITE = require('@/assets/images/gender-icons.png');

/**
 * Women and Men buttons (Figma 318:3837, 318:3839). Both look chosen while the filter is "all".
 * Tapping one chooses only it, and tapping it again goes back to both.
 */
export function GenderToggle({ value, onChange }: { value: GenderFilter; onChange: (next: GenderFilter) => void }) {
  const toggle = (g: Gender) => onChange(value === g ? 'all' : g);
  return (
    <View accessibilityRole="toolbar" accessibilityLabel="Filter by gender" className="flex-row">
      <GenderButton gender="women" selected={value === 'all' || value === 'women'} onPress={() => toggle('women')} />
      <GenderButton gender="men" selected={value === 'all' || value === 'men'} onPress={() => toggle('men')} />
    </View>
  );
}

function GenderButton({ gender, selected, onPress }: { gender: Gender; selected: boolean; onPress: () => void }) {
  const label = gender === 'women' ? 'Women' : 'Men';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      // Figma's button is 32 x 36, so the tap target is padded out to 44.
      className="h-11 w-11 items-center justify-center">
      <View
        accessible={false}
        className={`h-9 w-8 overflow-hidden rounded border bg-surface ${selected ? 'border-ink shadow-sm-strong' : 'border-muted'}`}>
        {/* The sprite holds both pictograms side by side; each button shows its own half. */}
        <View className={`absolute top-px h-[35px] overflow-hidden ${gender === 'women' ? 'left-1 w-[19px]' : 'left-2 w-[18px]'} ${selected ? '' : 'opacity-50'}`}>
          <Image
            source={SPRITE}
            accessibilityLabel={label}
            contentFit="fill"
            className={`absolute top-0 h-[35px] w-[35px] ${gender === 'women' ? 'left-0' : '-left-[17px]'}`}
          />
        </View>
      </View>
    </Pressable>
  );
}
