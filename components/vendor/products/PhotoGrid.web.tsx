import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { move, type PhotoGridProps } from '@/components/vendor/products/photoGridTypes';

/**
 * Web photo grid with real drag and drop (HTML5, so plain DOM elements; react-native-web Views can't be dragged).
 * The first photo is the cover. Each tile also has Earlier / Later buttons so it works from the keyboard.
 */
export function PhotoGrid({ photos, max, disabled, onChange, onAdd, onRetry }: PhotoGridProps) {
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-3">
        {photos.map((p, i) => (
          <View key={p.key} className="w-[30%] min-w-24 gap-1">
            <div
              draggable={!disabled}
              onDragStart={() => setFrom(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(i);
              }}
              onDragEnd={() => {
                setFrom(null);
                setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (from !== null) onChange(move(photos, from, i));
                setFrom(null);
                setOver(null);
              }}
              className={`relative aspect-[3/4] cursor-grab overflow-hidden rounded-xl bg-card ${over === i && from !== i ? 'ring-2 ring-primary' : 'border border-line'} ${from === i ? 'opacity-50' : ''}`}>
              <img src={p.uri} alt={`Photo ${i + 1}`} draggable={false} className="h-full w-full object-cover" />
              {i === 0 ? <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-inverse">Cover</span> : null}
              {p.state === 'uploading' ? (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs text-inverse">Uploading…</span>
              ) : null}
            </div>
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
                className={`h-11 w-11 items-center justify-center hover:bg-card ${i === 0 ? 'opacity-30' : ''}`}>
                <Text>←</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i + 1}`}
                disabled={disabled}
                onPress={() => onChange(photos.filter((x) => x.key !== p.key))}
                className="h-11 w-11 items-center justify-center hover:bg-card">
                <Text className="text-xs">✕</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move photo ${i + 1} later`}
                disabled={disabled || i === photos.length - 1}
                onPress={() => onChange(move(photos, i, i + 1))}
                className={`h-11 w-11 items-center justify-center hover:bg-card ${i === photos.length - 1 ? 'opacity-30' : ''}`}>
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
      {photos.length > 1 ? <Text className="text-xs text-primary-hover">Drag photos to reorder. The first photo is the cover.</Text> : null}
    </View>
  );
}
