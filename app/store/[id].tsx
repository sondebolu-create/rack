import { useLocalSearchParams } from 'expo-router';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export default function Store() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder name={`Brand store ${id}`} req="M3" back />;
}
