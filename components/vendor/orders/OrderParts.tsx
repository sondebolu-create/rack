import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatDate, formatPrice } from '@/lib/format';
import {
  ACTION_LABEL,
  STATUS_LABEL,
  canCancel,
  firstName,
  type FulfillmentItem,
  type FulfillmentStatus,
  type VendorFulfillment,
  type VendorListItem,
} from '@/lib/fulfillments';
import { telUrl, whatsappUrl } from '@/lib/phone';
import { colors } from '@/theme';

// Presentational. Loading, saving and the rules live in the order screens and lib/fulfillments.ts.

export const ORDER_FILTERS: { id: FulfillmentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reserved', label: 'New' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function OrderFilterChips({ value, onChange }: { value: FulfillmentStatus | 'all'; onChange: (v: FulfillmentStatus | 'all') => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Filter by status" className="flex-row flex-wrap gap-2">
      {ORDER_FILTERS.map((f) => (
        <Chip key={f.id} label={f.label} selected={value === f.id} onPress={() => onChange(f.id)} />
      ))}
    </View>
  );
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const tone = status === 'delivered' ? 'bg-primary' : status === 'cancelled' ? 'bg-strong' : status === 'reserved' ? 'border border-primary bg-surface' : 'bg-card border border-line';
  return (
    <View className={`self-start rounded-full px-3 py-1 ${tone}`}>
      <Text weight="medium" className={`text-xs ${status === 'delivered' ? 'text-inverse' : ''}`}>
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const COLS = 'lg:flex-row lg:items-center lg:gap-4';
const W = ['lg:w-24', 'lg:flex-1', 'lg:flex-1', 'lg:w-20', 'lg:flex-1', 'lg:flex-1'];

export function OrderTableHeader() {
  return (
    <View className={`hidden border-b border-line pb-2 ${COLS} lg:flex`}>
      {['Order', 'Date', 'Shopper', 'Items', 'Total', 'Status'].map((h, i) => (
        <Text key={h} weight="medium" className={`text-primary-hover ${W[i]}`}>
          {h}
        </Text>
      ))}
    </View>
  );
}

/** One row of the list. A View with a single link inside, so nothing nests. */
export function OrderRowView({ item, onOpen }: { item: VendorListItem; onOpen: () => void }) {
  const o = item.orders;
  const created = o ? formatDate(Date.parse(o.created_at)) : '';
  const items = `${item.itemCount} ${item.itemCount === 1 ? 'item' : 'items'}`;
  return (
    <View className={`gap-1 rounded-xl border border-line p-3 ${COLS} lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3`}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open order ${o?.order_number}, ${STATUS_LABEL[item.status]}, ${formatPrice(item.totalMinor, o?.currency)}`}
        onPress={onOpen}
        className={`min-h-11 justify-center ${W[0]}`}>
        <Text weight="medium">#{o?.order_number}</Text>
      </Pressable>
      <Text className={`text-primary-hover lg:text-ink ${W[1]}`}>{created}</Text>
      <Text className={W[2]}>{o ? firstName(o.delivery_name) : ''}</Text>
      <Text className={W[3]}>{items}</Text>
      <Text weight="medium" className={W[4]}>
        {formatPrice(item.totalMinor, o?.currency)}
      </Text>
      <View className={W[5]}>
        <FulfillmentBadge status={item.status} />
      </View>
    </View>
  );
}

export function ItemRows({ items, currency }: { items: FulfillmentItem[]; currency?: 'NGN' | 'USD' }) {
  return (
    <View className="gap-3">
      {items.map((i) => (
        <View key={i.id} className="flex-row items-center gap-3">
          <View className="h-16 w-12 overflow-hidden rounded-md bg-card">
            {i.photo ? <Image source={{ uri: i.photo }} accessibilityLabel={`${i.product_name} photo`} contentFit="cover" className="h-full w-full" /> : null}
          </View>
          <View className="flex-1 gap-0.5">
            <Text weight="medium">{i.product_name}</Text>
            <Text className="text-xs text-primary-hover">
              Size {i.size} · {i.colour_name} · Qty {i.quantity}
            </Text>
          </View>
          <Text weight="medium">{formatPrice(i.unit_price_minor * i.quantity, currency)}</Text>
        </View>
      ))}
    </View>
  );
}

function LinkButton({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  return <Button variant="secondary" fullWidth={false} label={label} onPress={() => void Linking.openURL(url)} />;
}

/** Delivery name, phone and address, with tap-to-call and WhatsApp (how most Lagos deliveries get arranged). */
export function CustomerCard({ order }: { order: NonNullable<VendorFulfillment['orders']> }) {
  const msg = `Hi ${firstName(order.delivery_name)}, this is about your Rack order #${order.order_number}.`;
  return (
    <View className="gap-3 rounded-xl bg-card p-4">
      <View className="gap-0.5">
        <Text className="text-primary-hover">Deliver to</Text>
        <Text weight="medium">{order.delivery_name}</Text>
        <Text>{order.delivery_address}</Text>
        <Text>{order.delivery_city}</Text>
      </View>
      <View className="gap-0.5">
        <Text className="text-primary-hover">Phone</Text>
        <Text weight="medium" selectable>
          {order.delivery_phone}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <LinkButton label="Call" url={telUrl(order.delivery_phone)} />
        <LinkButton label="WhatsApp" url={whatsappUrl(order.delivery_phone, msg)} />
      </View>
    </View>
  );
}

/** The next step, and Cancel with a required reason while the order hasn't shipped. */
export function OrderActions({
  status,
  busy,
  error,
  onAdvance,
  onCancel,
}: {
  status: FulfillmentStatus;
  busy: boolean;
  error?: string;
  onAdvance: () => void;
  onCancel: (reason: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();
  const label = ACTION_LABEL[status];
  if (!label && !canCancel(status)) return null;

  return (
    <View className="gap-3">
      {label ? <Button label={label} arrow loading={busy && !cancelling} disabled={busy} onPress={onAdvance} /> : null}
      {canCancel(status) && !cancelling ? <Button variant="secondary" label="Cancel order" disabled={busy} onPress={() => setCancelling(true)} /> : null}
      {cancelling ? (
        <View className="gap-2 rounded-xl border border-line p-4">
          <Text weight="medium">Why are you cancelling?</Text>
          <Text className="text-primary-hover">The shopper will see this. The items go back into your stock.</Text>
          <TextInput
            accessibilityLabel="Reason for cancelling"
            value={reason}
            onChangeText={(t) => {
              setReason(t);
              setReasonError(undefined);
            }}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholderTextColor={colors.muted}
            className={`h-24 rounded-md border bg-surface p-3 font-sans text-sm text-ink ${reasonError ? 'border-danger' : 'border-line'}`}
          />
          {reasonError ? (
            <Text accessibilityRole="alert" className="text-xs text-danger">
              {reasonError}
            </Text>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            <Button
              fullWidth={false}
              label="Confirm cancellation"
              loading={busy}
              onPress={() => (reason.trim() ? onCancel(reason) : setReasonError('Say why you are cancelling.'))}
            />
            <Button fullWidth={false} variant="ghost" label="Keep order" disabled={busy} onPress={() => setCancelling(false)} />
          </View>
        </View>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
