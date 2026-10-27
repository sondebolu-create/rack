import { View, type ViewProps } from 'react-native';

export type CardProps = Omit<ViewProps, 'style'> & {
  accessibilityLabel?: string;
  className?: string;
};

/** Light grey card. Muted text placed on it still needs 4.5:1 contrast. */
export function Card({ className = '', ...props }: CardProps) {
  return <View className={`rounded-xl bg-card p-4 ${className}`} {...props} />;
}
