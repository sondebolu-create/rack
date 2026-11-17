import { View } from 'react-native';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { formatDateTime, formatPrice } from '@/lib/format';
import type { PlacedOrder } from '@/lib/queries/orders';

/** Simple receipt for "View Receipt". There is no Figma frame for it, so it reuses the sheet and card styles. */
export function ReceiptSheet({ order, visible, onClose }: { order: PlacedOrder; visible: boolean; onClose: () => void }) {
  return (
    <Sheet visible={visible} title="Receipt" onClose={onClose}>
      <View className="gap-3 pb-4">
        <Line label={`Order #${order.order_number}`} value={formatDateTime(Date.parse(order.created_at))} />
        <View className="gap-2 rounded-md bg-card p-3">
          {order.items.map((i) => (
            <Line
              key={i.id}
              label={`${i.product_name} (${i.size}, ${i.colour_name}) × ${i.quantity}`}
              value={formatPrice(i.unit_price_minor * i.quantity, order.currency)}
            />
          ))}
        </View>
        {/* TODO(payments): show the payment method and "Paid" once Paystack records it. */}
        <Line label="Payment" value="Awaiting payment" />
        <Line label="Total" value={formatPrice(order.total_minor, order.currency)} strong />
      </View>
    </Sheet>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="flex-1">{label}</Text>
      <Text weight={strong ? 'bold' : 'medium'}>{value}</Text>
    </View>
  );
}
