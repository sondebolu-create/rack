import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export type FlowScreenProps = {
  title?: string;
  subtitle?: string;
  /** Hide for screens with no way back, like Order Confirmed. */
  back?: boolean;
  /** Full-width primary button pinned to the bottom with a trailing arrow (Figma "Proceed", "Review Order"). */
  cta?: { label: string; onPress: () => void; disabled?: boolean };
  /** Sits just above the button. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Shared frame for Cart, Checkout, Review, Confirmed and Track: Back, title, scrolling body, pinned button. */
export function FlowScreen({ title, subtitle, back = true, cta, footer, children }: FlowScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <Screen back={back} accessibilityLabel={title}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-6 pb-6 pt-2">
          {title ? (
            <View className="gap-1.5">
              <Text weight="medium" accessibilityRole="header" className="text-xl">
                {title}
              </Text>
              {subtitle ? <Text className="text-muted">{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </ScrollView>
        {footer}
        {cta ? (
          // Sits above the home indicator, so the offset is computed.
          <View className="pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
            <Button label={cta.label} arrow disabled={cta.disabled} onPress={cta.onPress} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
