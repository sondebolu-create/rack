import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { signOut, useAuthStore } from '@/lib/auth';
import { useConsent } from '@/lib/consent';
import { useProfile } from '@/lib/queries/profile';

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <View accessible className="gap-0.5">
      <Text className="text-xs text-primary-hover">{label}</Text>
      <Text weight="medium">{value || 'Not set'}</Text>
    </View>
  );
}

/** Settings tab: profile details, the way to orders and vendor areas, and log out. Not in Figma. */
export default function Settings() {
  const router = useRouter();
  const email = useAuthStore((s) => s.session?.user.email);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);
  const profile = useProfile();
  const openChoices = useConsent((c) => c.openChoices);
  const [busy, setBusy] = useState(false);

  const logOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
    router.replace('/onboarding');
  };

  const p = profile.data;
  return (
    <Screen scroll accessibilityLabel="Settings">
      <View className="gap-4 pt-2">
        <Text weight="medium" accessibilityRole="header" className="text-xl">
          Settings
        </Text>
        <Card className="gap-3">
          <Detail label="Full name" value={p?.full_name} />
          <Detail label="Email" value={email} />
          <Detail label="Phone number" value={p?.phone} />
          <Detail label="City" value={p?.city} />
        </Card>
        <Button variant="secondary" label="My orders" onPress={() => router.push('/orders')} />
        {role === 'vendor' ? <Button variant="secondary" label="Vendor dashboard" onPress={() => router.push('/vendor')} /> : null}
        {role === 'admin' ? <Button variant="secondary" label="Admin" onPress={() => router.push('/admin')} /> : null}
        {role === 'shopper' && application ? (
          <Button variant="secondary" label="Vendor application" onPress={() => router.push('/vendor/application')} />
        ) : null}
        {role === 'shopper' && !application ? (
          <Button variant="secondary" label="Sell on Rack" onPress={() => router.push('/vendor/apply')} />
        ) : null}
        <Button variant="primary" arrow label="Log out" loading={busy} onPress={logOut} />
        <View className="flex-row flex-wrap justify-center gap-x-4">
          <Button variant="ghost" fullWidth={false} label="Terms" onPress={() => router.push('/terms')} />
          <Button variant="ghost" fullWidth={false} label="Privacy" onPress={() => router.push('/privacy')} />
          <Button variant="ghost" fullWidth={false} label="Privacy choices" onPress={openChoices} />
        </View>
      </View>
    </Screen>
  );
}
