import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export default function Login() {
  const router = useRouter();
  return (
    <ScreenPlaceholder name="Log in" req="M1" back>
      <Input label="Email" placeholder="you@example.com" keyboardType="email-address" />
      <Button label="Continue" arrow onPress={() => router.replace('/home')} />
    </ScreenPlaceholder>
  );
}
