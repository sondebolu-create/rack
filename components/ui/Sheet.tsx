import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

export type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  /** Defaults to `title`. */
  accessibilityLabel?: string;
};

/** Bottom sheet with a grab handle and title. Tap the scrim to dismiss. */
export function Sheet({ visible, title, onClose, children, accessibilityLabel }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityLabel={accessibilityLabel ?? title}>
      <View className="flex-1 justify-end bg-ink/40">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          className="flex-1"
        />
        <View
          className="rounded-t-xl bg-surface px-4 pt-2 shadow-sm-strong"
          style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="mb-3 h-1 w-9 self-center rounded-full bg-strong" accessible={false} />
          <Text weight="bold" className="mb-3 text-lg" accessibilityRole="header">
            {title}
          </Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}
