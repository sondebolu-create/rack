import { ActivityIndicator, Pressable } from 'react-native';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Adds a trailing arrow. Primary buttons in Figma use it. */
  arrow?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  className?: string;
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-hover border border-primary',
  secondary: 'bg-surface border border-line active:bg-card',
  ghost: 'bg-transparent border border-transparent active:bg-card',
};

const TEXT: Record<ButtonVariant, string> = {
  primary: 'text-inverse',
  secondary: 'text-ink',
  ghost: 'text-ink',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  arrow = false,
  loading = false,
  disabled = false,
  accessibilityLabel,
  className = '',
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      className={`min-h-11 w-full flex-row items-center justify-center gap-2 rounded-md px-4 py-3 ${CONTAINER[variant]} ${inactive ? 'opacity-50' : ''} ${className}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#f3f4f6' : '#09090b'} />
      ) : (
        <>
          <Text weight="medium" className={TEXT[variant]}>
            {label}
          </Text>
          {arrow ? (
            <Text weight="medium" className={TEXT[variant]} accessible={false}>
              →
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
