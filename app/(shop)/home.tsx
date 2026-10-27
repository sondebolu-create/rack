import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AskRackgptPill } from '@/components/home/AskRackgptPill';
import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-surface">
      <ScreenPlaceholder name="Home" req="M2">
        <Button label="Brand store" variant="secondary" onPress={() => router.push('/store/1')} />
        <Button label="Product" variant="secondary" onPress={() => router.push('/product/1')} />
      </ScreenPlaceholder>
      <AskRackgptPill />
    </View>
  );
}
