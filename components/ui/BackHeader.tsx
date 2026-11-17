import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';

/** "← Back" link. Goes back, or to the start if there is nothing to go back to. */
export function BackLink() {
  const router = useRouter();
  return (
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
  );
}

export type BackHeaderProps = {
  title: string;
  /** Sits under the title, such as the "About Us" link. */
  below?: ReactNode;
  /** Sits at the right of the title row, such as the gender toggles. */
  right?: ReactNode;
  /** Hide the Back link (for an embedded preview). Defaults to true. */
  back?: boolean;
};

/** Back link, then a title row with optional content under and beside the title (Figma 318:3828). */
export function BackHeader({ title, below, right, back = true }: BackHeaderProps) {
  return (
    <View>
      {back ? <BackLink /> : null}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 gap-1">
          <Text weight="medium" accessibilityRole="header" className="text-xl">
            {title}
          </Text>
          {below}
        </View>
        {right}
      </View>
    </View>
  );
}
