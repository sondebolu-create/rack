import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { AuthLink, AuthSubmit, EmailField, FieldError, PasswordField } from '@/components/auth/EmailField';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { GOOGLE_AUTH_ENABLED, authRedirectUrl, landingFor, safeRedirect, useAuthStore, type Intent } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/lib/usePageTitle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Errors = { email?: string; password?: string; form?: string };

/**
 * M1 Log in / sign up. Figma 318:3450. Email + password with inline errors (no alerts). Where you land afterwards
 * is decided by lib/auth (a safe `?redirect=`, else your role). Google shows only when the provider is configured.
 */
export default function Login() {
  const router = useRouter();
  const { intent: intentParam, redirect: redirectParam } = useLocalSearchParams<{ intent?: string; redirect?: string }>();
  const intent: Intent = intentParam === 'sell' ? 'sell' : 'shop';
  const redirect = safeRedirect(redirectParam);
  usePageTitle('Log in or sign up');

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  // Signed in (just now, already, or back from Google): go where they were headed, else by role.
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);
  useEffect(() => {
    if (status !== 'ready' || !session) return;
    router.replace((redirect ?? landingFor({ role, application }, intent)) as never);
  }, [status, session, role, application, redirect, intent, router]);

  // Figma makes the logo a link; send it back to the buying/selling choice.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding'));
  const creating = mode === 'signup';

  const submit = async () => {
    if (busy) return;
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(trimmed)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    else if (creating && password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(next);
    setNotice('');
    if (next.email || next.password) return;

    setBusy(true);
    try {
      if (creating) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmed,
          password,
          // Role is never sent: new accounts are always shoppers, set by a database trigger.
          options: { emailRedirectTo: authRedirectUrl('/login') },
        });
        if (error) return setErrors({ form: friendly(error.message) });
        // With email confirmation on, an existing address comes back as a user with no identities.
        if (data.user && data.user.identities?.length === 0) {
          return setErrors({ email: 'An account with this email already exists. Log in instead.' });
        }
        if (!data.session) {
          setMode('login');
          setPassword('');
          setNotice('Check your email to confirm your account, then log in.');
        }
        // With a session, the effect above navigates once the profile has loaded.
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
        if (error) setErrors({ form: friendly(error.message) });
      }
    } catch {
      setErrors({ form: 'Could not reach Rack. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErrors({});
    // TODO(M1): native Google needs expo-web-browser (not installed). Web works once the provider is enabled.
    if (Platform.OS !== 'web') {
      return setErrors({ form: 'Google sign-in is not in the app yet. Use your email and password.' });
    }
    const qs = new URLSearchParams();
    if (redirect) qs.set('redirect', redirect);
    if (intent === 'sell') qs.set('intent', 'sell');
    const suffix = qs.toString() ? `?${qs}` : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${authRedirectUrl('/login')}${suffix}` },
    });
    if (error) setErrors({ form: friendly(error.message) });
  };

  return (
    <AuthBackdrop onLogoPress={goBack}>
      <Text weight="medium" accessibilityRole="header" className="text-xl text-inverse-icon">
        Log in or sign up
      </Text>
      <Text className="mt-1 text-base text-inverse-icon">
        {'You’d get access to all features\navailable on all stores.'}
      </Text>
      {/* Hidden until Google is enabled in Supabase. See GOOGLE_AUTH_ENABLED in lib/auth.ts. */}
      {GOOGLE_AUTH_ENABLED ? (
        <>
          <View className="mt-[57px]">
            <GoogleButton onPress={google} />
          </View>
          <View className="mx-[10px] mt-6 flex-row items-center justify-center gap-3.5">
            <Image
              source={require('@/assets/icons/divider-login.svg')}
              accessibilityLabel="Divider"
              accessible={false}
              contentFit="fill"
              className="h-[0.5px] w-[138px]"
            />
            <Text weight="medium" className="text-[17px] leading-[22px] tracking-[-0.408px] text-inverse-icon">
              Or
            </Text>
            <Image
              source={require('@/assets/icons/divider-login.svg')}
              accessibilityLabel="Divider"
              accessible={false}
              contentFit="fill"
              className="h-[0.5px] w-[138px]"
            />
          </View>
        </>
      ) : null}
      <View className={`gap-3 ${GOOGLE_AUTH_ENABLED ? 'mt-6' : 'mt-[57px]'}`}>
        <EmailField value={email} onChangeText={setEmail} error={errors.email} editable={!busy} onSubmitEditing={() => passwordRef.current?.focus()} returnKeyType="next" />
        <PasswordField
          inputRef={passwordRef}
          creating={creating}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          editable={!busy}
          onSubmitEditing={submit}
        />
        {notice ? (
          <Text accessibilityRole="alert" className="px-2 text-xs text-inverse">
            {notice}
          </Text>
        ) : null}
        <FieldError>{errors.form}</FieldError>
        <AuthSubmit label={creating ? 'Create account' : 'Log in'} onPress={submit} loading={busy} />
      </View>
      <View className="mt-2 items-center">
        <AuthLink
          label={creating ? 'Already have an account? Log in' : 'New to Rack? Create an account'}
          onPress={() => {
            setMode(creating ? 'login' : 'signup');
            setErrors({});
            setNotice('');
          }}
        />
        {!creating ? <AuthLink label="Forgot password?" onPress={() => router.push('/forgot-password')} /> : null}
      </View>
    </AuthBackdrop>
  );
}

/** Supabase messages are written for developers; keep the wording short and non-leaky. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Email or password is incorrect.';
  if (m.includes('email not confirmed')) return 'Confirm your email first. Check your inbox for the link.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many tries. Wait a minute and try again.';
  if (m.includes('already registered')) return 'An account with this email already exists. Log in instead.';
  if (m.includes('password')) return message;
  return 'Something went wrong. Try again.';
}
