import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

export type SheetProps = {
  visible: boolean;
  /** Omit for a sheet with no heading, such as the address search (Figma 318:4511). */
  title?: string;
  onClose: () => void;
  children?: ReactNode;
  /** Defaults to `title`. Give one when there is no title. */
  accessibilityLabel?: string;
  /** Tall sheet, about 90% of the screen, for lists. */
  fill?: boolean;
};

/** Bottom sheet with a grab handle and title. Tap the scrim to dismiss. */
export function Sheet({ visible, title, onClose, children, accessibilityLabel, fill = false }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityLabel={accessibilityLabel ?? title}>
      {/* Figma 318:4647 scrim is black at 86%. */}
      <View className="flex-1 justify-end bg-ink/85">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="flex-1"
        />
        <View
          className={`rounded-t-[14px] bg-surface px-5 pt-3 shadow-sm-strong ${fill ? 'h-[90%]' : ''}`}
          style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="h-0.5 w-[108px] self-center rounded-full bg-ink" accessible={false} />
          {title ? (
            <Text weight="medium" className="my-6 text-center text-lg" accessibilityRole="header">
              {title}
            </Text>
          ) : (
            <View className="h-6" />
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}
