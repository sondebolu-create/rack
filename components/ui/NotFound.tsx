import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './Button';
import { Screen } from './Screen';
import { Text } from './Text';

/** "We couldn't find that" for a product, store or page that is gone or never existed. */
export function NotFound({ title, body }: { title: string; body: string }) {
  const router = useRouter();
  return (
    <Screen back accessibilityLabel={title}>
      <View className="items-start gap-3 pt-4">
        <Text weight="medium" accessibilityRole="header" className="text-xl">
          {title}
        </Text>
        <Text className="text-primary-hover">{body}</Text>
        <Button variant="secondary" fullWidth={false} label="Go to Home" onPress={() => router.replace('/home')} />
      </View>
    </Screen>
  );
}
