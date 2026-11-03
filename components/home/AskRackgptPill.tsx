import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

/** Floating "Ask Rackgpt" button (Figma 251:1388): near-black, chat icon, trailing arrow. Routes to the RackGPT tab. */
export function AskRackgptPill() {
  const router = useRouter();
  return (
    <View pointerEvents="box-none" className="absolute inset-x-4 bottom-4 items-end">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ask Rackgpt"
        onPress={() => router.navigate('/rackgpt')}
        className="h-[52px] min-w-[161px] flex-row items-center justify-between gap-6 rounded-md border border-primary bg-primary px-4 shadow-sm-strong active:bg-primary-hover">
        <View className="flex-row items-center gap-2">
          <Icon name="chat" size={16} />
          <Text weight="medium" className="text-inverse">
            Ask Rackgpt
          </Text>
        </View>
        <Icon name="arrowRight" size={14} />
      </Pressable>
    </View>
  );
}
