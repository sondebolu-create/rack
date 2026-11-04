import { View } from 'react-native';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { formatDateTime, formatPrice } from '@/lib/format';
import type { Order } from '@/lib/orders';

/** Simple receipt for "View Receipt". There is no Figma frame for it, so it reuses the sheet and card styles. */
export function ReceiptSheet({ order, visible, onClose }: { order: Order; visible: boolean; onClose: () => void }) {
  const payment =
    order.payment === 'transfer' ? 'Bank Transfer' : order.card ? `${order.card.brand} xxxx-${order.card.last4}` : 'Card';
  return (
    <Sheet visible={visible} title="Receipt" onClose={onClose}>
      <View className="gap-3 pb-4">
        <Line label={`Order #${order.id}`} value={formatDateTime(order.createdAt)} />
        <View className="gap-2 rounded-md bg-card p-3">
          {order.items.map((i) => (
            <Line
              key={i.id}
              label={`${i.product.name} (${i.size}, ${i.color}) × ${i.qty}`}
              value={formatPrice(i.product.priceMinor * i.qty, i.product.currency)}
            />
          ))}
        </View>
        <Line label="Payment" value={payment} />
        <Line label="Total Paid" value={formatPrice(order.totalMinor, order.currency)} strong />
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
