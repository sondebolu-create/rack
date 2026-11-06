import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

export function GoogleButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      onPress={onPress}
      className="h-[50px] w-full flex-row items-center justify-center gap-2.5 rounded-full border border-inverse-icon hover:bg-white/10 active:bg-white/10">
      <Icon name="google" size={15} />
      <Text weight="medium" className="text-[17px] leading-[22px] tracking-[-0.408px] text-inverse-icon">
        Continue with Google
      </Text>
    </Pressable>
  );
}
