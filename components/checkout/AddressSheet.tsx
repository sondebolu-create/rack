import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useCheckoutStore } from '@/lib/checkout';
import { colors } from '@/theme';
import { IconBadge } from './PinBadge';

export type AddressSheetProps = { visible: boolean; onClose: () => void };

/**
 * "Enter Address" sheet (Figma 318:4511). Pick from the address book, or type a new one.
 * There is no places lookup yet, so typed addresses are saved as written.
 */
export function AddressSheet({ visible, onClose }: AddressSheetProps) {
  const [query, setQuery] = useState('');
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectAddress = useCheckoutStore((s) => s.selectAddress);
  const addAddress = useCheckoutStore((s) => s.addAddress);

  const q = query.trim().toLowerCase();
  const matches = q ? addresses.filter((a) => `${a.line1} ${a.line2}`.toLowerCase().includes(q)) : addresses;
  const canAddTyped = q.length > 0 && !addresses.some((a) => a.line1.toLowerCase() === q);

  const close = () => {
    setQuery('');
    onClose();
  };
  const choose = (id: string) => {
    selectAddress(id);
    close();
  };

  return (
    <Sheet visible={visible} fill accessibilityLabel="Enter Address" onClose={close}>
      <View className="flex-row items-center gap-2 rounded-xl bg-card px-3 py-2.5">
        <Icon name="search" size={16} />
        <TextInput
          accessibilityLabel="Enter Address"
          placeholder="Enter Address"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          returnKeyType="done"
          className="min-h-6 flex-1 font-sans text-sm text-ink"
        />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" className="mt-4 flex-1">
        {canAddTyped ? (
          <AddressOption
            title={query.trim()}
            subtitle="Use this address"
            onPress={() => {
              addAddress(query);
              close();
            }}
          />
        ) : null}
        {matches.map((a) => (
          <AddressOption key={a.id} title={a.line1} subtitle={a.line2} onPress={() => choose(a.id)} />
        ))}
        {!canAddTyped && matches.length === 0 ? <Text className="py-3 text-muted">No saved addresses match.</Text> : null}
      </ScrollView>
    </Sheet>
  );
}

function AddressOption({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      className="min-h-11 flex-row items-start gap-2.5 border-b border-line py-3">
      <IconBadge />
      <View className="flex-1 gap-1">
        <Text>{title}</Text>
        {subtitle ? <Text className="text-muted">{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}
