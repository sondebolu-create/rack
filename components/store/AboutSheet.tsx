import { View } from 'react-native';
import { Image } from '@/components/ui/Image';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';

/**
 * "About Us" sheet. There is no Figma frame for it yet. It shows the item count, plus whatever the shop has
 * filled in (banner, logo, city, description).
 */
export function AboutSheet({
  visible,
  vendorName,
  itemCount,
  description,
  city,
  logoUrl,
  bannerUrl,
  onClose,
}: {
  visible: boolean;
  vendorName: string;
  itemCount: number;
  description?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} title={`About ${vendorName}`} onClose={onClose}>
      <View className="gap-3 pb-6">
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} accessibilityLabel={`${vendorName} banner`} contentFit="cover" className="aspect-[8/3] w-full rounded-xl bg-card" />
        ) : null}
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} accessibilityLabel={`${vendorName} logo`} contentFit="cover" className="h-16 w-16 self-center rounded-full bg-card" />
        ) : null}
        {city ? <Text className="text-center text-muted">{city}</Text> : null}
        {description ? <Text>{description}</Text> : null}
        <Text className="text-center text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in this store
        </Text>
      </View>
    </Sheet>
  );
}
