import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { AuthLink, AuthSubmit, PasswordField } from '@/components/auth/EmailField';
import { Text } from '@/components/ui/Text';
import { landingFor, useAuthStore } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/lib/usePageTitle';

const MIN_PASSWORD = 8;

/**
 * Where the reset email lands. On web, supabase-js reads the tokens from the URL by itself. On iOS there is no
 * URL detection, so the link's tokens are read here and handed to setSession.
 */
function useRecoveryLink() {
  const url = Linking.useURL();
  useEffect(() => {
    if (Platform.OS === 'web' || !url || !url.includes('access_token=')) return;
    const params = new URLSearchParams(url.split('#')[1] ?? '');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) void supabase.auth.setSession({ access_token, refresh_token });
  }, [url]);
}

export default function ResetPassword() {
  const router = useRouter();
  usePageTitle('Choose a new password');
  useRecoveryLink();
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    setError(undefined);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(err.message.toLowerCase().includes('password') ? err.message : 'Could not save the password. Try again.');
      else router.replace(landingFor({ role, application }) as never);
    } catch {
      setError('Could not reach Rack. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  // No session once loading is done means the link was opened without valid tokens, or has expired.
  const expired = status === 'ready' && !session;

  return (
    <AuthBackdrop>
      <Text weight="medium" accessibilityRole="header" className="text-xl text-inverse-icon">
        Choose a new password
      </Text>
      {expired ? (
        <View className="mt-6 gap-3">
          <Text accessibilityRole="alert" className="text-base text-inverse-icon">
            This reset link has expired or was already used.
          </Text>
          <AuthLink label="Send a new link" onPress={() => router.replace('/forgot-password')} />
        </View>
      ) : (
        <View className="mt-10 gap-3">
          <PasswordField creating value={password} onChangeText={setPassword} error={error} editable={!busy} onSubmitEditing={submit} />
          <AuthSubmit label="Save password" onPress={submit} loading={busy || status === 'loading'} />
        </View>
      )}
    </AuthBackdrop>
  );
}
