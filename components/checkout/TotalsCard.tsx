import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { formatPrice, type Currency } from '@/lib/format';

/** Subtotal, Shipping, Tax (Figma 318:4285). Shipping and tax are worked out at checkout (spec M6). */
export function TotalsCard({ subtotalMinor, currency }: { subtotalMinor: number; currency: Currency }) {
  return (
    <View className="gap-2 rounded-md bg-card p-2">
      <Row label="Subtotal" value={formatPrice(subtotalMinor, currency)} strong />
      <Row label="Shipping" value="Calculated at checkout" />
      <Row label="Tax" value="Calculated at checkout" />
    </View>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text weight="medium">{label}</Text>
      {/* primary-hover, not muted: muted fails contrast on the grey card. */}
      <Text weight="medium" className={`text-xs ${strong ? '' : 'text-primary-hover'}`}>
        {value}
      </Text>
    </View>
  );
}
