import { Pressable, TextInput, View } from 'react-native';
import { colors } from '@/theme';
import { Icon } from './Icon';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Called by the filter button. Filters are visual only for now, so Home and the store leave it off. */
  onFiltersPress?: () => void;
  className?: string;
};

/** Grey search field with a filter button inside (Figma 318:3841). Placeholder is muted on grey, the known exception. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search brands or products',
  onFiltersPress,
  className = '',
}: SearchBarProps) {
  return (
    <View className={`min-h-11 flex-row items-center gap-2 rounded-xl bg-card pl-3 pr-1 ${className}`}>
      <Icon name="search" size={16} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        className="flex-1 font-sans text-sm text-ink"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filters"
        onPress={onFiltersPress}
        className="h-11 w-11 items-center justify-center">
        <Icon name="sliders" size={16} />
      </Pressable>
    </View>
  );
}
