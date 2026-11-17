import type { ComponentRef, Ref } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

export type AuthFieldProps = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'onSubmitEditing' | 'returnKeyType' | 'editable'
> & {
  /** Message shown under the field. Also turns the border red. */
  error?: string;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
};

const BASE =
  'h-[50px] w-full rounded-[20px] border bg-[rgba(255,255,255,0.03)] px-6 font-sans-medium text-sm text-inverse';

/**
 * Inline error under a dark field. Figma has no error state for these frames. #dc2626 (text-danger) is only
 * about 3:1 on the dark photo, so the text stays text-inverse and the field border carries the red.
 */
export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" className="mt-1.5 px-2 text-xs text-inverse">
      {children}
    </Text>
  );
}

/** Dark pill email field from the log in frame. The shared Input is a light, labelled field, so it can't express this. */
export function EmailField({ error, inputRef, ...props }: AuthFieldProps) {
  return (
    <View>
      <TextInput
        ref={inputRef}
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
        aria-invalid={!!error}
        className={`${BASE} ${error ? 'border-danger' : 'border-[#d0d5dd]'}`}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </View>
  );
}

/** Same pill, for the password. `newPassword` tells password managers to offer a strong one on sign up. */
export function PasswordField({ error, creating = false, inputRef, ...props }: AuthFieldProps & { creating?: boolean }) {
  return (
    <View>
      <TextInput
        ref={inputRef}
        accessibilityLabel="Password"
        placeholder="Password"
        placeholderTextColor={colors.inverse}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={creating ? 'new-password' : 'current-password'}
        textContentType={creating ? 'newPassword' : 'password'}
        returnKeyType="go"
        aria-invalid={!!error}
        className={`${BASE} ${error ? 'border-danger' : 'border-[#d0d5dd]'}`}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </View>
  );
}

/** Text link on the dark backdrop with a 44pt tap target. */
export function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-11 items-center justify-center hover:opacity-80 active:opacity-70">
      <Text weight="medium" className="text-sm text-inverse-icon underline">
        {label}
      </Text>
    </Pressable>
  );
}

/** Light pill submit button for the dark backdrop (the Primary button is near-black, so it would vanish on the photo). */
export function AuthSubmit({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      disabled={loading}
      onPress={onPress}
      className={`h-[50px] w-full items-center justify-center rounded-full bg-surface hover:bg-strong active:bg-strong ${loading ? 'opacity-60' : ''}`}>
      <Text weight="medium" className="text-[17px] leading-[22px] tracking-[-0.408px]">
        {loading ? 'Please wait…' : label}
      </Text>
    </Pressable>
  );
}
