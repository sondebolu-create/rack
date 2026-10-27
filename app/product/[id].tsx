import { useLocalSearchParams } from 'expo-router';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder name={`Product ${id}`} req="M4" back />;
}
