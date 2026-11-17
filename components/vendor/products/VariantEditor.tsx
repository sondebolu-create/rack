import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { cellKey, newKey, type ColourItem, type ProductForm } from '@/lib/products';
import { SIZES, type Size } from '@/lib/types';
import { colors } from '@/theme';

/** Starter swatches. `hex` is product data (what the item looks like), not a UI token. */
const SWATCHES: { name: string; hex: string }[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#00a63e' },
  { name: 'Red', hex: '#c10007' },
  { name: 'Pink', hex: '#f9a8d4' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Beige', hex: '#d6c4a5' },
  { name: 'Brown', hex: '#7c4a2d' },
  { name: 'Purple', hex: '#7e22ce' },
];

type Props = {
  form: ProductForm;
  error?: string;
  coloursError?: string;
  disabled?: boolean;
  set: (patch: Partial<ProductForm>) => void;
};

function Dot({ hex, size = 24 }: { hex: string; size?: number }) {
  // The fill is the product's colour, so it is a dynamic value.
  return <View accessible={false} className="rounded-full border border-line" style={{ width: size, height: size, backgroundColor: hex }} />;
}

function ColourRow({ colour, onChange, onRemove }: { colour: ColourItem; onChange: (c: ColourItem) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-2 rounded-xl border border-line p-3">
      <View className="flex-row items-end gap-2">
        <Input label="Colour name" value={colour.name} onChangeText={(name) => onChange({ ...colour, name })} maxLength={30} className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pick a swatch for ${colour.name || 'this colour'}`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(!open)}
          className="h-14 w-14 items-center justify-center rounded-md border border-line hover:bg-card">
          <Dot hex={colour.hex} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${colour.name || 'colour'}`} onPress={onRemove} className="h-14 w-11 items-center justify-center">
          <Text>✕</Text>
        </Pressable>
      </View>
      {open ? (
        <View className="gap-3">
          <View accessibilityRole="radiogroup" accessibilityLabel="Swatches" className="flex-row flex-wrap">
            {SWATCHES.map((s) => (
              <Pressable
                key={s.hex}
                accessibilityRole="radio"
                accessibilityLabel={s.name}
                accessibilityState={{ checked: colour.hex.toLowerCase() === s.hex }}
                onPress={() => onChange({ ...colour, hex: s.hex, name: colour.name.trim() ? colour.name : s.name })}
                className="h-11 w-11 items-center justify-center">
                <View className={`h-8 w-8 items-center justify-center rounded-full border-2 ${colour.hex.toLowerCase() === s.hex ? 'border-primary' : 'border-transparent'}`}>
                  <Dot hex={s.hex} />
                </View>
              </Pressable>
            ))}
          </View>
          <Input
            label="Or type a colour code"
            value={colour.hex}
            onChangeText={(hex) => onChange({ ...colour, hex: hex.startsWith('#') ? hex : `#${hex}` })}
            helper="Six characters, like #1e3a8a"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={7}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Sizes, colours, and the sizes x colours grid where stock is entered. */
export function VariantEditor({ form, error, coloursError, disabled, set }: Props) {
  const [all, setAll] = useState('');

  const toggleSize = (s: Size) => set({ sizes: form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : SIZES.filter((x) => x === s || form.sizes.includes(x)) });
  const setCell = (size: Size, c: ColourItem, text: string) => set({ stock: { ...form.stock, [cellKey(size, c.key)]: text.replace(/\D/g, '').slice(0, 4) } });
  const applyAll = () => {
    const stock = { ...form.stock };
    for (const s of form.sizes) for (const c of form.colours) stock[cellKey(s, c.key)] = all;
    set({ stock });
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text weight="medium">Sizes</Text>
        <View className="flex-row flex-wrap gap-2">
          {SIZES.map((s) => (
            <Chip key={s} label={s} selected={form.sizes.includes(s)} disabled={disabled} onPress={() => toggleSize(s)} />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text weight="medium">Colours</Text>
        {form.colours.map((c) => (
          <ColourRow
            key={c.key}
            colour={c}
            onChange={(next) => set({ colours: form.colours.map((x) => (x.key === c.key ? next : x)) })}
            onRemove={() => set({ colours: form.colours.filter((x) => x.key !== c.key) })}
          />
        ))}
        {coloursError ? (
          <Text accessibilityRole="alert" className="text-xs text-danger">
            {coloursError}
          </Text>
        ) : null}
        <Button
          variant="secondary"
          fullWidth={false}
          label="Add a colour"
          disabled={disabled || form.colours.length >= 10}
          onPress={() => set({ colours: [...form.colours, { key: newKey(), name: '', hex: '#000000' }] })}
        />
      </View>

      {form.sizes.length > 0 && form.colours.length > 0 ? (
        <View className="gap-3">
          <Text weight="medium">Stock</Text>
          <View className="flex-row items-end gap-2">
            <Input label="Same stock for all" value={all} onChangeText={(t) => setAll(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" className="flex-1" />
            <Button variant="secondary" fullWidth={false} label="Apply" disabled={!all || disabled} onPress={applyAll} className="mb-0" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="gap-1">
              <View className="flex-row items-center gap-1">
                <View className="w-28" />
                {form.sizes.map((s) => (
                  <Text key={s} weight="medium" className="w-16 text-center">
                    {s}
                  </Text>
                ))}
              </View>
              {form.colours.map((c) => (
                <View key={c.key} className="flex-row items-center gap-1">
                  <View className="w-28 flex-row items-center gap-2">
                    <Dot hex={c.hex} size={16} />
                    <Text numberOfLines={1} className="flex-1">
                      {c.name || 'Colour'}
                    </Text>
                  </View>
                  {form.sizes.map((s) => (
                    <TextInput
                      key={s}
                      accessibilityLabel={`Stock for ${c.name || 'colour'} in size ${s}`}
                      value={form.stock[cellKey(s, c.key)] ?? ''}
                      onChangeText={(t) => setCell(s, c, t)}
                      editable={!disabled}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                      className="h-11 w-16 rounded-md border border-line bg-surface text-center font-sans text-sm text-ink"
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Text className="text-primary-hover">Pick at least one size and add a colour to enter stock.</Text>
      )}
      {error ? (
        <Text accessibilityRole="alert" className="text-xs text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
