import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { OptionRow } from '@/components/auth/OptionRow';
import { Image } from '@/components/ui/Image';
import { usePageTitle } from '@/lib/usePageTitle';

export default function Onboarding() {
  const router = useRouter();
  usePageTitle('Welcome');
  // The vendor path is out of MVP scope (no self-serve vendor onboarding), so both choices go to log in for now.
  const next = () => router.push('/login');
  return (
    <AuthBackdrop>
      <View className="gap-6">
        <OptionRow
          icon="onbCart"
          iconSize={15}
          title="I am buying"
          body={'Customer profile allows you buy any\nfashion item from any fashion store'}
          onPress={next}
        />
        {/* Figma: 310 x 1 line, #696969. */}
        <Image
          source={require('@/assets/icons/divider-onboarding.svg')}
          accessibilityLabel="Divider"
          accessible={false}
          contentFit="fill"
          className="h-px w-[310px]"
        />
        <OptionRow
          icon="onbStore"
          iconSize={18}
          title="I am selling"
          body={'Vendor profile allows you create a\nstore on your app for your products'}
          onPress={next}
        />
      </View>
    </AuthBackdrop>
  );
}
