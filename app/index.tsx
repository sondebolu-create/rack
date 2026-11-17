import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { landingFor, useAuthStore } from '@/lib/auth';
import { colors } from '@/theme';

/** Signed in: straight to their landing page. Otherwise the onboarding choice. Waits for the stored session first. */
export default function Index() {
  const status = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} />
      </View>
    );
  }
  return <Redirect href={session ? landingFor({ role, application }) : '/onboarding'} />;
}
