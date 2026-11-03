import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from '@/components/ui/Image';
import type { ProductDetail } from '@/lib/types';

/**
 * One large photo with two beside it (Figma 318:4075). Tapping a small photo makes it the large one,
 * and the previous large photo takes its place in the column.
 */
export function Gallery({ images }: { images: ProductDetail['gallery'] }) {
  const [selected, setSelected] = useState(0);
  const main = images[selected];
  const others = images.map((img, index) => ({ img, index })).filter((o) => o.index !== selected);

  return (
    <View className="flex-row gap-2">
      <View className="aspect-square flex-[219]">
        <Image source={main.source} accessibilityLabel={main.alt} contentFit="cover" className="h-full w-full rounded-xl" />
      </View>
      <View className="flex-[118] gap-1.5">
        {others.map(({ img, index }, i) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Show photo ${index + 1} of ${images.length}: ${img.alt}`}
            onPress={() => setSelected(index)}
            className={i === 0 ? 'flex-[118]' : 'flex-[95]'}>
            <Image source={img.source} accessibilityLabel={img.alt} contentFit="cover" className="h-full w-full rounded-xl" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
