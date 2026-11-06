import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { EmailField } from '@/components/auth/EmailField';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { usePageTitle } from '@/lib/usePageTitle';

export default function Login() {
  const router = useRouter();
  usePageTitle('Log in or sign up');
  const [email, setEmail] = useState('');

  // UI only for now: no validation, no Supabase. Any submit goes to Home.
  const submit = () => router.replace('/home');
  // Figma makes the logo a link; send it back to the buying/selling choice.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding'));

  return (
    <AuthBackdrop onLogoPress={goBack}>
      <Text weight="medium" accessibilityRole="header" className="text-xl text-inverse-icon">
        Log in or sign up
      </Text>
      <Text className="mt-1 text-base text-inverse-icon">
        {'You’d get access to all features\navailable on all stores.'}
      </Text>
      <View className="mt-[57px]">
        <GoogleButton onPress={submit} />
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
      <View className="mt-6">
        <EmailField value={email} onChangeText={setEmail} onSubmitEditing={submit} />
      </View>
    </AuthBackdrop>
  );
}
