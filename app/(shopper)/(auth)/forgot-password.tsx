import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { AuthLink, AuthSubmit, EmailField } from '@/components/auth/EmailField';
import { Text } from '@/components/ui/Text';
import { authRedirectUrl } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/lib/usePageTitle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sends the Supabase reset email. The link opens /reset-password. No Figma frame: reuses the log in backdrop. */
export default function ForgotPassword() {
  const router = useRouter();
  usePageTitle('Reset password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) return setError(trimmed ? 'Enter a valid email address.' : 'Enter your email address.');
    setError(undefined);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: authRedirectUrl('/reset-password'),
      });
      // Same message whether or not the address has an account, so this can't be used to probe for accounts.
      if (err && !/not found/i.test(err.message)) setError('Could not send the email. Try again in a minute.');
      else setSent(true);
    } catch {
      setError('Could not reach Rack. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthBackdrop onLogoPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}>
      <Text weight="medium" accessibilityRole="header" className="text-xl text-inverse-icon">
        Reset your password
      </Text>
      <Text className="mt-1 text-base text-inverse-icon">
        {'We’ll email you a link to choose\na new password.'}
      </Text>
      <View className="mt-10 gap-3">
        <EmailField value={email} onChangeText={setEmail} error={error} editable={!busy} onSubmitEditing={submit} returnKeyType="go" />
        {sent ? (
          <Text accessibilityRole="alert" className="px-2 text-xs text-inverse">
            If that email has an account, a reset link is on its way.
          </Text>
        ) : null}
        <AuthSubmit label="Send reset link" onPress={submit} loading={busy} />
      </View>
      <View className="mt-2 items-center">
        <AuthLink label="Back to log in" onPress={() => router.replace('/login')} />
      </View>
    </AuthBackdrop>
  );
}
