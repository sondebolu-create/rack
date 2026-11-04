import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';

export type RadioRowProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
  /** Delivery options use a 16pt mark and medium text; payment options a 20pt mark and regular text. */
  large?: boolean;
};

/**
 * Radio option (Figma 318:4311, 318:4326). The mark is drawn in token colours. The payment radios in Figma
 * use the template grey scale, which CLAUDE.md says to ignore. The whole row is the 44pt tap target.
 */
export function RadioRow({ label, checked, onPress, large = false }: RadioRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-2">
      <View
        accessible={false}
        className={`items-center justify-center rounded-full border border-primary bg-surface ${large ? 'h-5 w-5' : 'h-4 w-4'}`}>
        {checked ? <View className={`rounded-full bg-primary ${large ? 'h-2.5 w-2.5' : 'h-2 w-2'}`} /> : null}
      </View>
      <Text weight={large ? 'regular' : 'medium'}>{label}</Text>
    </Pressable>
  );
}
