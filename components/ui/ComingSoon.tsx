import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { joinWaitlist, type WaitlistFeature } from '@/lib/queries/waitlist';

const COPY: Record<WaitlistFeature, { title: string; line: string }> = {
  rackgpt: {
    title: 'RackGPT is coming soon',
    line: 'Describe or upload any outfit and RackGPT finds matching pieces from Lagos vendors.',
  },
  tryon: {
    title: 'Try it on is coming soon',
    line: 'See how a piece looks on you before you reserve it.',
  },
};

/** What a feature is, in one line, plus an email box that joins the waitlist. The same pattern for every switched-off feature. */
export function ComingSoonPanel({ feature }: { feature: WaitlistFeature }) {
  const copy = COPY[feature];
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    const r = await joinWaitlist(email, feature);
    setBusy(false);
    if ('error' in r) setError(r.error);
    else setDone(true);
  };

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text weight="medium" accessibilityRole="header" className="text-xl">
          {copy.title}
        </Text>
        <Text className="text-primary-hover">{copy.line}</Text>
      </View>
      {done ? (
        <Text accessibilityRole="alert" weight="medium">
          You are on the list. We will email you when it is ready.
        </Text>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(undefined);
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
          <Button label="Notify me" arrow loading={busy} onPress={() => void submit()} />
        </>
      )}
    </View>
  );
}

/** The same panel in a bottom sheet, for buttons that open it in place (Try it on). */
export function ComingSoonSheet({ feature, visible, onClose }: { feature: WaitlistFeature; visible: boolean; onClose: () => void }) {
  return (
    <Sheet visible={visible} title="Coming soon" onClose={onClose}>
      <View className="pb-6">
        {/* Remounts on each open so a finished form starts fresh. */}
        {visible ? <ComingSoonPanel feature={feature} /> : null}
      </View>
    </Sheet>
  );
}
