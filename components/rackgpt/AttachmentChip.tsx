import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { ImageSource } from '@/lib/types';

/** File extension of a picked photo, e.g. "jpg". Falls back to "jpeg" for bundled assets. */
function extensionOf(source: ImageSource): string {
  if (typeof source === 'object' && source !== null && 'uri' in source && source.uri) {
    const match = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(source.uri);
    if (match) return match[1].toLowerCase();
  }
  return 'jpeg';
}

/** "Photo.jpeg" chip with a 16pt thumbnail. Pass `onRemove` in the composer to show the X. */
export function AttachmentChip({ source, onRemove }: { source: ImageSource; onRemove?: () => void }) {
  return (
    <View className="flex-row items-center gap-2.5 self-start rounded-lg bg-surface px-3 py-2">
      <Image
        source={source}
        accessibilityLabel="Attached photo"
        contentFit="cover"
        className="h-4 w-4 rounded-sm"
      />
      <Text className="text-xs">
        Photo<Text className="text-xs text-muted">.{extensionOf(source)}</Text>
      </Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove attached photo"
          hitSlop={14}
          onPress={onRemove}>
          <Icon name="x" size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}
