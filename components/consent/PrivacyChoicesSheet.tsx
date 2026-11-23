import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { ANALYTICS_CONFIGURED, doNotTrack } from '@/lib/analytics';
import { useConsent } from '@/lib/consent';

/** "Privacy choices": see and change the analytics decision at any time. Opened from the footer links and the account screen. */
export function PrivacyChoicesSheet() {
  const { choice, sheetOpen, accept, decline, closeChoices } = useConsent();
  const router = useRouter();
  const dnt = doNotTrack();

  const status = !ANALYTICS_CONFIGURED
    ? 'Rack is not collecting analytics in this version.'
    : dnt
      ? 'Your browser’s Do Not Track setting is on, so nothing is sent whatever you choose here.'
      : choice === 'granted'
        ? 'Analytics is on. Thank you.'
        : choice === 'denied'
          ? 'Analytics is off. Nothing is sent.'
          : 'You have not chosen yet. Nothing is sent until you accept.';

  return (
    <Sheet visible={sheetOpen} title="Privacy choices" onClose={closeChoices}>
      <View className="gap-4 pb-6">
        <Text accessibilityLiveRegion="polite" weight="medium">
          {status}
        </Text>
        <Text className="text-primary-hover">
          Analytics counts which pages and actions are used, anonymously, so we can improve Rack. It is never linked to your account or email.
          Turning it off also deletes its random id from this device.
        </Text>
        {ANALYTICS_CONFIGURED && !dnt ? (
          <View className="gap-2">
            <Button label="Accept analytics" variant={choice === 'granted' ? 'secondary' : 'primary'} disabled={choice === 'granted'} onPress={accept} />
            <Button label="Decline analytics" variant={choice === 'denied' ? 'secondary' : 'primary'} disabled={choice === 'denied'} onPress={decline} />
          </View>
        ) : null}
        <Button
          variant="ghost"
          label="Read the Privacy Policy"
          onPress={() => {
            closeChoices();
            router.push('/privacy');
          }}
        />
      </View>
    </Sheet>
  );
}
