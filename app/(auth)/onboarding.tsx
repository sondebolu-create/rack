import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export default function Onboarding() {
  const router = useRouter();
  return (
    <ScreenPlaceholder name="Onboarding" req="M1">
      <Button label="I am buying" arrow onPress={() => router.push('/login')} />
      <Button label="I am selling" variant="secondary" onPress={() => router.push('/login')} />
    </ScreenPlaceholder>
  );
}
