import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

export type QuantityStepperProps = {
  value: number;
  max: number;
  /** Called with the new quantity. Going below 1 gives 0, which the screen treats as "remove from cart". */
  onChange: (value: number) => void;
};

/** Dark stepper that replaces "Add to cart" once the item is in the cart (Figma 318:4165). */
export function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
  return (
    <View className="h-[50px] flex-row items-center rounded-md border border-primary bg-primary px-1 shadow-sm-strong">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value === 1 ? 'Remove from cart' : 'Decrease quantity'}
        onPress={() => onChange(value - 1)}
        className="h-11 w-11 items-center justify-center">
        <Icon name="minusCircle" size={22} />
      </Pressable>
      <Text
        accessibilityLabel={`Quantity ${value}`}
        accessibilityLiveRegion="polite"
        className="min-w-6 text-center text-base text-inverse">
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: value >= max }}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        className={`h-11 w-11 items-center justify-center ${value >= max ? 'opacity-40' : ''}`}>
        <Icon name="plusCircle" size={22} />
      </Pressable>
    </View>
  );
}
