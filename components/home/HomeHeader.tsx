import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { colors } from '@/theme';

/** Search field with a filter button, plus the cart button. Search and filters are visual only for now. */
export function HomeHeader({ cartHasItems = false }: { cartHasItems?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <View className="flex-row items-center gap-1">
      <View className="min-h-11 flex-1 flex-row items-center gap-2 rounded-xl bg-card pl-3 pr-1">
        <Icon name="search" size={16} />
        <TextInput
          accessibilityLabel="Search brands or products"
          placeholder="Search brands or products"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          className="flex-1 font-sans text-sm text-ink"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          className="h-11 w-11 items-center justify-center">
          <Icon name="sliders" size={16} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cartHasItems ? 'Cart, has items' : 'Cart'}
        onPress={() => router.navigate('/cart')}
        className="h-11 w-11 items-center justify-center">
        <View>
          <Icon name="cart" size={34} />
          {cartHasItems ? (
            <View accessible={false} className="absolute right-2 top-[7px] h-1 w-1 rounded-full bg-danger" />
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
