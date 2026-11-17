import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { signOut, useAuthStore } from '@/lib/auth';

/** Simple account screen (M1): who you are, where else you can go, and sign out. Sign-in is enforced by the shopper layout. */
export default function Account() {
  const router = useRouter();
  const email = useAuthStore((s) => s.session?.user.email);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);
  const [busy, setBusy] = useState(false);

  const out = async () => {
    setBusy(true);
    await signOut();
    router.replace('/onboarding');
  };

  return (
    <Screen back accessibilityLabel="Account">
      <View className="gap-4 pt-2">
        <Text weight="medium" accessibilityRole="header" className="text-xl">
          Account
        </Text>
        <Card>
          <Text className="text-primary-hover">Signed in as</Text>
          <Text weight="medium">{email}</Text>
        </Card>
        {role === 'vendor' ? <Button variant="secondary" label="Vendor dashboard" onPress={() => router.push('/vendor')} /> : null}
        {role === 'admin' ? <Button variant="secondary" label="Admin" onPress={() => router.push('/admin')} /> : null}
        {role === 'shopper' && application ? (
          <Button variant="secondary" label="Vendor application" onPress={() => router.push('/vendor/application')} />
        ) : null}
        {role === 'shopper' && !application ? (
          <Button variant="secondary" label="Sell on Rack" onPress={() => router.push('/vendor/apply')} />
        ) : null}
        <Button variant="primary" arrow label="Sign out" loading={busy} onPress={out} />
      </View>
    </Screen>
  );
}
