import { Pressable, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import type { StoreCategory } from '@/lib/categories';

export type CategoryTabsProps = {
  categories: StoreCategory[];
  selected: string;
  onSelect: (id: string) => void;
};

/** Icon-over-label category tabs (Figma 318:3846). Built from data; the chosen one has a dark underline. */
export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      // Bleeds to the screen edge with a hairline under it, as in Figma.
      className="-mx-4 grow-0 border-b border-line"
      contentContainerClassName="gap-[18px] px-4">
      {categories.map((c) => {
        const on = c.id === selected;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="tab"
            accessibilityLabel={c.label}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(c.id)}
            className={`min-h-11 min-w-11 items-center gap-1 border-b-2 p-2 ${on ? 'border-ink' : 'border-transparent'}`}>
            <Icon name={c.icon} size={24} />
            <Text weight="medium" className={`text-xs ${on ? 'text-ink' : 'text-muted'}`}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
