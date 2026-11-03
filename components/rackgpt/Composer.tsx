import { Pressable, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { ImageSource } from '@/lib/types';
import { colors } from '@/theme';
import { AttachmentChip } from './AttachmentChip';
import type { PhotoSource } from './pickPhoto';

export type ComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  attachment: ImageSource | null;
  /** Open the photo library or the system camera. */
  onAttach: (from: PhotoSource) => void;
  onRemoveAttachment: () => void;
  canSend: boolean;
  onSend: () => void;
  /** Greys the field out while a request is being processed. */
  disabled?: boolean;
};

/**
 * Message box at the bottom of RackGPT. The paperclip picks a photo from the library, the camera
 * button takes one with the system camera, and send appears once there is something to send.
 * Once a photo is attached both attach buttons give way to send, as in Figma.
 */
export function Composer({
  value,
  onChangeText,
  attachment,
  onAttach,
  onRemoveAttachment,
  canSend,
  onSend,
  disabled = false,
}: ComposerProps) {
  return (
    <View
      className={`flex-row items-end gap-1 rounded-md border border-line bg-surface p-2 ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-1 gap-2 rounded-sm bg-card p-1">
        {attachment ? <AttachmentChip source={attachment} onRemove={onRemoveAttachment} /> : null}
        <TextInput
          accessibilityLabel="Describe your outfit request"
          placeholder="Describe your outfit request here"
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline
          className="max-h-28 min-h-8 py-1 font-sans text-base text-ink"
        />
      </View>
      {attachment ? null : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach a photo from your library"
            disabled={disabled}
            onPress={() => onAttach('library')}
            className="h-11 w-11 items-center justify-center">
            <Icon name="paperclip" size={27} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
            disabled={disabled}
            onPress={() => onAttach('camera')}
            className="h-11 w-11 items-center justify-center">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-strong">
              <Icon name="camera" size={14} />
            </View>
          </Pressable>
        </>
      )}
      {canSend ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={disabled}
          onPress={onSend}
          className="h-11 w-11 items-center justify-center">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-strong">
            <Icon name="send" size={14} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
