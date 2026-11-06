import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { KeyboardAvoid } from '@/components/ui/KeyboardAvoid';

export type AuthBackdropProps = {
  children: ReactNode;
  /** Makes the Rack logo a link (the log in frame has it as one). */
  onLogoPress?: () => void;
};

function Logo({ onPress }: { onPress?: () => void }) {
  const mark = (
    <View className="ml-6 self-start rounded-xl bg-[rgba(24,24,24,0.5)] px-3 py-2">
      {/* Figma draws "R ck" with a hanger vector sitting in the gap where the "a" goes. */}
      <View className="relative" accessible={false}>
        <RNText className="font-mono text-[40px] leading-[48px] text-white">R ck</RNText>
        <View className="absolute left-[28px] top-[17px]">
          <Icon name="logoHanger" size={21} />
        </View>
      </View>
    </View>
  );
  if (!onPress) {
    return (
      <View accessible accessibilityLabel="Rack" accessibilityRole="image">
        {mark}
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Rack" onPress={onPress}>
      {mark}
    </Pressable>
  );
}

/** Shared frame for the two onboarding screens: store photo, dark scrim, Rack logo and tagline. */
export function AuthBackdrop({ children, onLogoPress }: AuthBackdropProps) {
  return (
    <View className="flex-1 bg-ink">
      <StatusBar style="light" />
      <Image
        source={require('@/assets/images/onboarding-bg.jpg')}
        accessibilityLabel="Inside a fashion store"
        contentFit="cover"
        // Figma crops the square photo toward its right side.
        contentPosition={{ left: '82%' }}
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0 bg-[rgba(0,0,0,0.7)]" />
      <SafeAreaView edges={['bottom']} className="flex-1">
        {/* iOS app: the ScrollView adjusts itself. Web: KeyboardAvoid lifts the form above the keyboard. */}
        <KeyboardAvoid native={false}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow pt-[141px]"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          bounces={false}
          showsVerticalScrollIndicator={false}>
          <Logo onPress={onLogoPress} />
          <View className="mt-[101px] px-6">{children}</View>
        </ScrollView>
        </KeyboardAvoid>
        <View className="items-center">
          <View className="rounded-xl bg-[rgba(47,47,47,0.5)] px-3 py-2 opacity-30">
            <RNText className="text-center font-mono text-base text-white">
              The future of fashion stores
            </RNText>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
