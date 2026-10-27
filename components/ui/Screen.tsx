import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from './Text';

export type ScreenProps = {
  children?: ReactNode;
  /** Shows a "Back" header with an arrow. */
  back?: boolean;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

export function Screen({
  children,
  back = false,
  scroll = false,
  accessibilityLabel,
  className = '',
}: ScreenProps) {
  const router = useRouter();
  const body = scroll ? (
    <ScrollView className="flex-1" contentContainerClassName={`pb-8 ${className}`}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`}>{children}</View>
  );

  return (
    <SafeAreaView
      accessibilityLabel={accessibilityLabel}
      edges={['top', 'left', 'right']}
      className="flex-1 bg-surface px-4">
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          className="min-h-11 flex-row items-center gap-2 self-start">
          <Text weight="medium" accessible={false}>
            ←
          </Text>
          <Text weight="medium">Back</Text>
        </Pressable>
      ) : null}
      {body}
    </SafeAreaView>
  );
}
