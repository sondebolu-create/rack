import { Pressable, View } from 'react-native';
import { Text } from './Text';

export type SwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/** Label plus toggle (Figma "Switch"). The whole row is the 44pt tap target. */
export function Switch({ label, value, onValueChange }: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      className="min-h-11 flex-row items-center gap-2">
      <Text className="text-xs">{label}</Text>
      <View
        accessible={false}
        className={`h-5 w-9 rounded-full p-0.5 ${value ? 'items-end bg-primary' : 'items-start bg-strong'}`}>
        <View className="h-4 w-4 rounded-full bg-surface" />
      </View>
    </Pressable>
  );
}
