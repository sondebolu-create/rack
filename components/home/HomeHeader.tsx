import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SearchBar } from '@/components/ui/SearchBar';

/** Search field with a filter button, plus the cart button. Search and filters are visual only for now. */
export function HomeHeader({ cartHasItems = false }: { cartHasItems?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <View className="flex-row items-center gap-1">
      <SearchBar value={query} onChangeText={setQuery} className="flex-1" />
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
