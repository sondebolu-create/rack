import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextWeight = 'regular' | 'medium' | 'bold';

const FAMILY: Record<TextWeight, string> = {
  regular: 'font-sans',
  medium: 'font-sans-medium',
  bold: 'font-sans-bold',
};

export type TextProps = RNTextProps & {
  weight?: TextWeight;
  className?: string;
};

/** Cabinet Grotesk text. Defaults to ink, text-sm. Pick the weight with `weight`, not font-* classes. */
export function Text({ weight = 'regular', className = '', ...props }: TextProps) {
  return <RNText className={`text-sm text-ink ${FAMILY[weight]} ${className}`} {...props} />;
}
