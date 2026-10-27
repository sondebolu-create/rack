import { Pressable } from 'react-native';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  className?: string;
};

/** Size chip (S/M/L/XL). 44pt minimum tap target. */
export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  className = '',
}: ChipProps) {
  const tone = selected ? 'bg-primary border-primary' : 'bg-surface border-line';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-11 min-w-11 items-center justify-center rounded-full border px-4 ${tone} ${disabled ? 'opacity-40' : ''} ${className}`}>
      <Text
        weight="medium"
        className={`${selected ? 'text-inverse' : 'text-ink'} ${disabled ? 'line-through' : ''}`}>
        {label}
      </Text>
    </Pressable>
  );
}
