import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '@/theme';

export type EmailFieldProps = Pick<TextInputProps, 'value' | 'onChangeText' | 'onSubmitEditing'>;

/** Dark pill email field from the log in frame. The shared Input is a light, labelled field, so it can't express this. */
export function EmailField(props: EmailFieldProps) {
  return (
    <TextInput
      accessibilityLabel="Email Address"
      placeholder="Email Address"
      // Figma shows the "Email Address" copy in text-inverse, not a muted placeholder tone.
      placeholderTextColor={colors.inverse}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      autoCorrect={false}
      textContentType="emailAddress"
      returnKeyType="go"
      className="h-[50px] w-full rounded-[20px] border border-[#d0d5dd] bg-[rgba(255,255,255,0.03)] px-6 font-sans-medium text-sm text-inverse"
      {...props}
    />
  );
}
