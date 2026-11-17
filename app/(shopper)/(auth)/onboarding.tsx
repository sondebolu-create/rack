import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthBackdrop } from '@/components/auth/AuthBackdrop';
import { OptionRow } from '@/components/auth/OptionRow';
import { AuthLink } from '@/components/auth/EmailField';
import { Image } from '@/components/ui/Image';
import { usePageTitle } from '@/lib/usePageTitle';

export default function Onboarding() {
  const router = useRouter();
  usePageTitle('Welcome');
  // The choice rides along as a route param. It only decides where the new account lands (Home or the vendor
  // application): it is never written to the account, which is always created as a shopper.
  const next = (intent: 'shop' | 'sell') => () => router.push({ pathname: '/login', params: { intent } });
  return (
    <AuthBackdrop>
      <View className="gap-6">
        <OptionRow
          icon="onbCart"
          iconSize={15}
          title="I am buying"
          body={'Customer profile allows you buy any\nfashion item from any fashion store'}
          onPress={next('shop')}
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
          onPress={next('sell')}
        />
        {/* Not in Figma: guests may browse Home, stores and products without an account. */}
        <AuthLink label="Browse as a guest" onPress={() => router.replace('/home')} />
      </View>
    </AuthBackdrop>
  );
}
