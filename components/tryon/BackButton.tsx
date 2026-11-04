import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

/** Light "Back" for the black try-on screens (Figma 318:4683). */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-0.5 self-start">
      <Icon name="arrowLeftLight" size={21} />
      <Text className="text-base text-inverse">Back</Text>
    </Pressable>
  );
}
