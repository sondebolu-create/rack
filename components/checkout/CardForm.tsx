import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { formatCardNumber, formatExpiry, type CardErrors, type CardFields } from '@/lib/card';
import { colors } from '@/theme';

export type CardFormProps = {
  value: CardFields;
  onChange: (next: CardFields) => void;
  errors: CardErrors;
};

/**
 * Card fields (Figma 318:4332). Mock payment: the number and CVV stay in this form's state only.
 * Paystack collects cards itself in Week 3, and this form goes away.
 */
export function CardForm({ value, onChange, errors }: CardFormProps) {
  const set = (patch: Partial<CardFields>) => onChange({ ...value, ...patch });
  return (
    <View className="gap-4">
      <Text>Enter Card Information</Text>
      <Input
        label="Cardholder Name"
        value={value.name}
        onChangeText={(name) => set({ name })}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="cc-name"
        textContentType="name"
      />
      <Input
        label="Card Number"
        value={value.number}
        onChangeText={(n) => set({ number: formatCardNumber(n) })}
        error={errors.number}
        placeholder="0000 0000 0000 0000"
        keyboardType="number-pad"
        autoComplete="cc-number"
        textContentType="creditCardNumber"
        maxLength={23}
      />
      <View className="flex-row gap-4">
        <View className="flex-[192]">
          <Input
            label="Expiry Date"
            value={value.expiry}
            onChangeText={(e) => set({ expiry: formatExpiry(e) })}
            error={errors.expiry}
            placeholder="MM/YY"
            keyboardType="number-pad"
            autoComplete="cc-exp"
            maxLength={7}
            // Figma's calendar icon is the template grey, so it is tinted to our muted token.
            trailing={<Icon name="calendar" size={20} tintColor={colors.muted} />}
          />
        </View>
        <View className="flex-[148]">
          <Input
            label="CVV"
            value={value.cvv}
            onChangeText={(c) => set({ cvv: c.replace(/\D/g, '').slice(0, 4) })}
            error={errors.cvv}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
            autoComplete="cc-csc"
            maxLength={4}
            trailing={<Icon name="lock" size={20} tintColor={colors.muted} />}
          />
        </View>
      </View>
    </View>
  );
}
