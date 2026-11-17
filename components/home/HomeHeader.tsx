import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SearchBar } from '@/components/ui/SearchBar';

/** Search field with a filter button, plus the cart button. The filter button is still visual only. */
export function HomeHeader({
  cartHasItems = false,
  query,
  onQueryChange,
}: {
  cartHasItems?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-1">
      <SearchBar value={query} onChangeText={onQueryChange} className="flex-1" />
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
