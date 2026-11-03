import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';
import type { ExploreTile } from '@/lib/types';
import { SizeRow } from './SizeRow';

/** Collage tile: one large photo, one tall, two small. `flip` puts the small pair first. */
export function ExploreCard({ tile, flip = false }: { tile: ExploreTile; flip?: boolean }) {
  const router = useRouter();
  const [a, b, c, d] = tile.images;

  const small = (
    <View key="small" className="flex-[66] justify-center gap-[5px]">
      {[c, d].map((img, i) =>
        img ? (
          <Image
            key={i}
            source={img.source}
            accessibilityLabel={img.alt}
            contentFit="cover"
            className="aspect-square w-full rounded-lg"
          />
        ) : null,
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tile.name} by ${tile.vendorName}, ${formatPrice(tile.priceMinor, tile.currency)}`}
      onPress={() => router.push(`/store/${tile.vendorId}`)}
      className="gap-1.5 rounded-md border border-line bg-card p-2">
      <View className="h-[137px] flex-row gap-[5px]">
        {flip ? small : null}
        {a ? (
          <Image source={a.source} accessibilityLabel={a.alt} contentFit="cover" className="h-full flex-[137] rounded-xl" />
        ) : null}
        {b ? (
          <Image source={b.source} accessibilityLabel={b.alt} contentFit="cover" className="h-full flex-[126] rounded-xl" />
        ) : null}
        {flip ? null : small}
      </View>
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs">{tile.vendorName}</Text>
          <SizeRow available={tile.sizes} />
        </View>
        <Text weight="medium">{tile.name}</Text>
        <Text weight="medium" className="text-xs">
          {formatPrice(tile.priceMinor, tile.currency)}
        </Text>
      </View>
    </Pressable>
  );
}
