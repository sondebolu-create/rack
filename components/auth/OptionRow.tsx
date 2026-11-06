import { Pressable, View } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

export type OptionRowProps = {
  icon: IconName;
  /** Icon box is 18pt in Figma; the cart glyph is 15pt inside it. */
  iconSize: number;
  title: string;
  body: string;
  onPress: () => void;
};

export function OptionRow({ icon, iconSize, title, body, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body.replace('\n', ' ')}`}
      onPress={onPress}
      className="flex-row items-center hover:opacity-80 active:opacity-70">
      <View className="h-[30px] w-[18px] items-center justify-center self-start" accessible={false}>
        <Icon name={icon} size={iconSize} />
      </View>
      <View className="ml-2 flex-1" accessible={false}>
        <Text weight="medium" className="text-lg text-white">
          {title}
        </Text>
        <Text className="text-inverse-icon">{body}</Text>
      </View>
      <View className="mr-3" accessible={false}>
        <Icon name="onbArrow" size={24} />
      </View>
    </Pressable>
  );
}
