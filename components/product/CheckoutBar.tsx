import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatPrice, type Currency } from '@/lib/format';

export type CheckoutBarProps = {
  totalMinor: number;
  currency: Currency;
  onCheckout: () => void;
};

/** Floating bar with the running total and "Checkout" (Figma 318:4165). Sits over the scrolling page. */
export function CheckoutBar({ totalMinor, currency, onCheckout }: CheckoutBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      // Sits above the home indicator, so the offset is computed.
      style={{ bottom: insets.bottom + 8 }}
      // bg-ink/60 matches Figma. White text on it stays at 4.8:1 even over a white page.
      className="absolute inset-x-4 flex-row items-center justify-between rounded-md border-b border-disabled bg-ink/60 px-4 py-2 shadow-sm-strong">
      <View accessible accessibilityLabel={`Total amount ${formatPrice(totalMinor, currency)}`} className="gap-1">
        <Text className="text-xs text-inverse">Total Amount</Text>
        <Text weight="medium" className="text-inverse">
          {formatPrice(totalMinor, currency)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Checkout"
        onPress={onCheckout}
        className="min-h-11 flex-row items-center gap-2.5">
        <Text weight="medium" className="text-inverse">
          Checkout
        </Text>
        <Icon name="arrowRight" size={24} />
      </Pressable>
    </View>
  );
}
