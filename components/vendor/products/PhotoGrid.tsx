import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { move, type PhotoGridProps } from '@/components/vendor/products/photoGridTypes';

/**
 * Native photo grid. Long-press a photo to pick it up, then tap where it should go (tap it again to cancel).
 * The first photo is the cover. Each tile also has Earlier / Later buttons, for screen readers.
 * (A free drag would need a gesture library; web has real drag and drop.)
 */
export function PhotoGrid({ photos, max, disabled, onChange, onAdd, onRetry }: PhotoGridProps) {
  const [lifted, setLifted] = useState<number | null>(null);

  const tap = (i: number) => {
    if (lifted === null) return;
    if (lifted !== i) onChange(move(photos, lifted, i));
    setLifted(null);
  };

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-3">
        {photos.map((p, i) => (
          <View key={p.key} className="w-[30%] min-w-24 gap-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Photo ${i + 1}${i === 0 ? ', cover' : ''}${lifted === i ? ', picked up. Tap a place to put it.' : '. Long press to move.'}`}
              disabled={disabled}
              delayLongPress={350}
              onLongPress={() => setLifted(i)}
              onPress={() => tap(i)}
              className={`aspect-[3/4] overflow-hidden rounded-xl bg-card ${lifted === i ? 'border-2 border-primary' : 'border border-line'} ${lifted !== null && lifted !== i ? 'opacity-70' : ''}`}>
              <Image source={{ uri: p.uri }} accessibilityLabel={`Photo ${i + 1}`} contentFit="cover" className="h-full w-full" />
              {i === 0 ? (
                <View className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-0.5">
                  <Text className="text-xs text-inverse">Cover</Text>
                </View>
              ) : null}
              {p.state === 'uploading' ? (
                <View className="absolute inset-0 items-center justify-center bg-ink/60">
                  <Text className="text-xs text-inverse">Uploading…</Text>
                </View>
              ) : null}
            </Pressable>
            {p.state === 'error' ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Retry upload of photo ${i + 1}`} onPress={onRetry} className="min-h-11 justify-center">
                <Text accessibilityRole="alert" className="text-xs text-danger underline">
                  Failed. Retry
                </Text>
              </Pressable>
            ) : null}
            <View className="flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move photo ${i + 1} earlier`}
                disabled={disabled || i === 0}
                onPress={() => onChange(move(photos, i, i - 1))}
                className={`h-11 w-11 items-center justify-center ${i === 0 ? 'opacity-30' : ''}`}>
                <Text>←</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i + 1}`}
                disabled={disabled}
                onPress={() => onChange(photos.filter((x) => x.key !== p.key))}
                className="h-11 w-11 items-center justify-center">
                <Text className="text-xs">✕</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move photo ${i + 1} later`}
                disabled={disabled || i === photos.length - 1}
                onPress={() => onChange(move(photos, i, i + 1))}
                className={`h-11 w-11 items-center justify-center ${i === photos.length - 1 ? 'opacity-30' : ''}`}>
                <Text>→</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {photos.length < max ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
            disabled={disabled}
            onPress={onAdd}
            className="aspect-[3/4] w-[30%] min-w-24 items-center justify-center gap-1 rounded-xl border border-dashed border-muted hover:bg-card">
            <Icon name="plusDark" size={20} />
            <Text className="text-xs">Add photo</Text>
          </Pressable>
        ) : null}
      </View>
      {photos.length > 1 ? <Text className="text-xs text-primary-hover">Long press a photo, then tap where it should go. The first photo is the cover.</Text> : null}
    </View>
  );
}
