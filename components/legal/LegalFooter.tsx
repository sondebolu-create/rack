import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { useConsent } from '@/lib/consent';

/** Terms, Privacy Policy and Privacy choices in one row. `dark` is for the photo backdrop on the sign-in screens. */
export function LegalFooter({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const openChoices = useConsent((c) => c.openChoices);
  const tone = dark ? 'text-inverse-icon' : 'text-primary-hover';
  const items = [
    { label: 'Terms', onPress: () => router.push('/terms') },
    { label: 'Privacy Policy', onPress: () => router.push('/privacy') },
    { label: 'Privacy choices', onPress: openChoices },
  ];
  return (
    <View accessibilityRole="menu" className="flex-row flex-wrap items-center justify-center gap-x-4">
      {items.map((i) => (
        <Pressable key={i.label} accessibilityRole="link" accessibilityLabel={i.label} onPress={i.onPress} className="min-h-11 justify-center hover:opacity-80">
          <Text className={`text-xs underline ${tone}`}>{i.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
