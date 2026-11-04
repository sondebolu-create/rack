import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatDateTime } from '@/lib/format';
import { ORDER_STEPS, type Order } from '@/lib/orders';

/**
 * Order tracking timeline (Figma 318:4437). The step the order is on has the filled dot, earlier steps a
 * hollow dot. Steps still to come are dimmed and have no time yet.
 */
export function OrderTimeline({ order }: { order: Order }) {
  const current = ORDER_STEPS.findIndex((s) => s.status === order.status);
  return (
    <View className="gap-2">
      {ORDER_STEPS.map((step, i) => {
        const reached = i <= current;
        const at = order.history[step.status];
        const first = i === 0;
        const last = i === ORDER_STEPS.length - 1;
        return (
          <View
            key={step.status}
            accessible
            accessibilityLabel={`${step.title}. ${step.body}. ${at ? formatDateTime(at) : 'Not yet'}`}
            className={`flex-row items-stretch gap-4 ${reached ? '' : 'opacity-50'}`}>
            <View className="relative w-3 items-center">
              {/* One line down the column, from the first dot to the last. */}
              <View className={`absolute w-px bg-strong ${first ? 'top-[18px]' : 'top-0'} ${last ? 'h-[18px]' : '-bottom-2'}`} />
              <View className="mt-3">
                <Icon name={i === current ? 'dotOn' : 'dotOff'} size={12} />
              </View>
            </View>
            <View className="flex-1 gap-1.5 rounded-lg bg-card p-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text weight="medium">{step.title}</Text>
                {at ? <Text className="text-xs text-primary-hover">{formatDateTime(at)}</Text> : null}
              </View>
              <Text weight="medium" className="text-xs text-primary-hover">
                {step.body}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
