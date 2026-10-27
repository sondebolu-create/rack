import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'className' | 'style'> & {
  label: string;
  helper?: string;
  error?: string;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  className?: string;
};

export function Input({
  label,
  helper,
  error,
  accessibilityLabel,
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={`w-full gap-1 ${className}`}>
      <Text weight="medium">{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor="#71717a"
        className={`min-h-11 rounded-md border bg-surface px-3 py-2 font-sans text-sm text-ink ${
          error ? 'border-danger' : 'border-line'
        } ${props.editable === false ? 'bg-card opacity-60' : ''}`}
        {...props}
      />
      {error ? (
        <Text className="text-xs text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : helper ? (
        <Text className="text-xs text-muted">{helper}</Text>
      ) : null}
    </View>
  );
}
