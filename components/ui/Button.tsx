import { ActivityIndicator, Pressable } from 'react-native';
import { colors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Adds a trailing arrow. Primary buttons in Figma use it. */
  arrow?: boolean;
  /** Leading icon (a light one, for the primary variant). */
  icon?: IconName;
  /** Defaults to true. Pass false for a button that hugs its content. */
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  className?: string;
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover active:bg-primary-hover border border-primary',
  secondary: 'bg-surface border border-line hover:bg-card active:bg-card',
  ghost: 'bg-transparent border border-transparent hover:bg-card active:bg-card',
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
  icon,
  fullWidth = true,
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
      className={`h-[50px] ${fullWidth ? 'w-full' : 'self-start'} flex-row items-center justify-center gap-2.5 rounded-md px-4 ${CONTAINER[variant]} ${inactive ? 'opacity-50' : ''} ${className}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.inverse : colors.ink} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={16} /> : null}
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
