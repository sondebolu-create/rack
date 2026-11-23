import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ANALYTICS_CONFIGURED, doNotTrack } from '@/lib/analytics';
import { useConsent } from '@/lib/consent';

/**
 * Asks once, at the bottom of the screen, whether Rack may use anonymous analytics. PostHog sends nothing until
 * Accept. Shown only when analytics is switched on in this build, the saved answer has loaded and there isn't one,
 * and the browser isn't already saying Do Not Track (then nothing is ever sent, so there is nothing to ask).
 */
export function ConsentBanner() {
  const { choice, hydrated, accept, decline } = useConsent();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  if (!ANALYTICS_CONFIGURED || !hydrated || choice !== null || doNotTrack()) return null;

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 items-center px-3" style={{ paddingBottom: insets.bottom + 12 }}>
      <View
        accessibilityRole="alert"
        accessibilityLabel="Analytics choice"
        className="w-full max-w-[480px] gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm-strong">
        <View className="gap-1">
          <Text weight="medium">Help us improve Rack?</Text>
          <Text className="text-primary-hover">
            With your OK, we count which pages and actions are used, anonymously. It is never linked to your account or email, and nothing is sent
            unless you accept.{' '}
            <Text weight="medium" accessibilityRole="link" className="underline" onPress={() => router.push('/privacy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button className="flex-1" variant="secondary" fullWidth={false} label="Decline" onPress={decline} />
          <Button className="flex-1" fullWidth={false} label="Accept" onPress={accept} />
        </View>
      </View>
    </View>
  );
}
