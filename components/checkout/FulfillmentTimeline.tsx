import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatDateTime } from '@/lib/format';
import { historyMs, type FulfillmentStatus } from '@/lib/fulfillments';
import { ORDER_STEPS } from '@/lib/orders';
import type { Database } from '@/lib/database.types';

type Row = Database['public']['Tables']['order_fulfillments']['Row'];

/** The four Figma steps, in order, and the real status each one stands for. */
const STEP_STATUS: FulfillmentStatus[] = ['reserved', 'confirmed', 'shipped', 'delivered'];

/**
 * Timeline for one shop's part of an order (Figma 318:4437, same look as OrderTimeline). The step the order is on
 * has the filled dot; steps still to come are dimmed. A cancelled fulfillment shows the steps it reached, then a
 * Cancelled card with the reason. Used by the shopper's Track Order and the vendor's order detail.
 */
export function FulfillmentTimeline({ fulfillment }: { fulfillment: Pick<Row, 'status' | 'history' | 'updated_at' | 'cancel_reason'> }) {
  const at = historyMs(fulfillment);
  const cancelled = fulfillment.status === 'cancelled';
  const current = cancelled ? -1 : STEP_STATUS.indexOf(fulfillment.status);
  // A cancelled order only shows the steps it actually reached.
  const steps = ORDER_STEPS.map((s, i) => ({ ...s, key: STEP_STATUS[i] })).filter((s) => !cancelled || at[s.key] !== undefined);

  return (
    <View className="gap-2">
      {steps.map((step, i) => {
        const index = STEP_STATUS.indexOf(step.key);
        const reached = cancelled || index <= current;
        const time = at[step.key];
        const first = i === 0;
        const last = i === steps.length - 1 && !cancelled;
        return (
          <View
            key={step.key}
            accessible
            accessibilityLabel={`${step.title}. ${step.body}. ${time ? formatDateTime(time) : 'Not yet'}`}
            className={`flex-row items-stretch gap-4 ${reached ? '' : 'opacity-50'}`}>
            <View className="relative w-3 items-center">
              <View className={`absolute w-px bg-strong ${first ? 'top-[18px]' : 'top-0'} ${last ? 'h-[18px]' : '-bottom-2'}`} />
              <View className="mt-3">
                <Icon name={index === current ? 'dotOn' : 'dotOff'} size={12} />
              </View>
            </View>
            <View className="flex-1 gap-1.5 rounded-lg bg-card p-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text weight="medium">{step.title}</Text>
                {time ? <Text className="text-xs text-primary-hover">{formatDateTime(time)}</Text> : null}
              </View>
              <Text weight="medium" className="text-xs text-primary-hover">
                {step.body}
              </Text>
            </View>
          </View>
        );
      })}
      {cancelled ? (
        <View accessible accessibilityLabel={`Cancelled. ${fulfillment.cancel_reason ?? ''}`} className="flex-row items-stretch gap-4">
          <View className="relative w-3 items-center">
            <View className="absolute top-0 h-[18px] w-px bg-strong" />
            <View className="mt-3">
              <Icon name="dotOn" size={12} />
            </View>
          </View>
          <View className="flex-1 gap-1.5 rounded-lg bg-card p-2">
            <View className="flex-row items-center justify-between gap-2">
              <Text weight="medium">Cancelled</Text>
              {at.cancelled ? <Text className="text-xs text-primary-hover">{formatDateTime(at.cancelled)}</Text> : null}
            </View>
            {fulfillment.cancel_reason ? <Text className="text-xs text-primary-hover">{fulfillment.cancel_reason}</Text> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
