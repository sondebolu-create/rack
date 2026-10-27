import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';

/** Floating "Ask Rackgpt" pill: black, chat icon, trailing arrow. Routes to the RackGPT tab. */
export function AskRackgptPill() {
  const router = useRouter();
  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-4 items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ask Rackgpt"
        onPress={() => router.navigate('/rackgpt')}
        className="min-h-11 flex-row items-center gap-2 rounded-full bg-primary px-4 py-3 shadow-sm-strong active:bg-primary-hover">
        <View
          accessible={false}
          className="h-3.5 w-4 rounded-sm border-2 border-inverse"
        />
        <Text weight="medium" className="text-inverse">
          Ask Rackgpt
        </Text>
        <Text weight="medium" className="text-inverse" accessible={false}>
          →
        </Text>
      </Pressable>
    </View>
  );
}
