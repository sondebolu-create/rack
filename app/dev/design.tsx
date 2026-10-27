import { useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';

const COLORS = [
  { name: 'ink', hex: '#09090b', bg: 'bg-ink' },
  { name: 'muted', hex: '#71717a', bg: 'bg-muted' },
  { name: 'inverse', hex: '#f3f4f6', bg: 'bg-inverse' },
  { name: 'surface', hex: '#ffffff', bg: 'bg-surface' },
  { name: 'strong / line', hex: '#e4e4e7', bg: 'bg-strong' },
  { name: 'primary', hex: '#18181b', bg: 'bg-primary' },
  { name: 'primary-hover', hex: '#27272a', bg: 'bg-primary-hover' },
  { name: 'card', hex: '#f4f4f5', bg: 'bg-card' },
  { name: 'danger', hex: '#dc2626', bg: 'bg-danger' },
];

const TYPE = [
  { name: 'xs 12/16', cls: 'text-xs' },
  { name: 'sm 14/20', cls: 'text-sm' },
  { name: 'base 16/24', cls: 'text-base' },
  { name: 'lg 18/30', cls: 'text-lg' },
  { name: 'xl 20/28', cls: 'text-xl' },
  { name: '2xl 24/32', cls: 'text-2xl' },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3 pt-6">
      <Text weight="bold" className="text-xs uppercase text-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function DesignSystem() {
  const [size, setSize] = useState('M');
  const [sheet, setSheet] = useState(false);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen back scroll accessibilityLabel="Design system">
      <Text weight="bold" className="text-2xl">
        Design system
      </Text>

      <Section title="Colour">
        <View className="flex-row flex-wrap gap-3">
          {COLORS.map((c) => (
            <View key={c.name} className="w-28 gap-1">
              <View className={`h-12 rounded-xl border border-line ${c.bg}`} accessible={false} />
              <Text weight="medium" className="text-xs">
                {c.name}
              </Text>
              <Text className="text-xs text-muted">{c.hex}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type · Cabinet Grotesk">
        {TYPE.map((t) => (
          <Text key={t.name} className={t.cls}>
            {t.name} · Ankara co-ord set
          </Text>
        ))}
        <Text weight="medium">Medium · {formatPrice(1850000)}</Text>
        <Text weight="bold">Bold · {formatPrice(4999, 'USD')}</Text>
      </Section>

      <Section title="Buttons">
        <Button label="Primary" arrow />
        <Button label="Secondary" variant="secondary" />
        <Button label="Ghost" variant="ghost" />
        <Button label="Loading" loading />
        <Button label="Disabled" disabled />
      </Section>

      <Section title="Chips">
        <View className="flex-row flex-wrap gap-2">
          {['S', 'M', 'L', 'XL'].map((s) => (
            <Chip key={s} label={s} selected={size === s} onPress={() => setSize(s)} />
          ))}
          <Chip label="XXL" disabled />
        </View>
      </Section>

      <Section title="Input">
        <Input label="Default" placeholder="Placeholder" helper="Helper text" />
        <Input label="Error" defaultValue="not-an-email" error="Enter a valid email" />
        <Input label="Disabled" defaultValue="Locked" editable={false} />
      </Section>

      <Section title="Card & shadows">
        <Card>
          <Text weight="medium">Card</Text>
          <Text className="text-muted">Light grey, rounded-xl</Text>
        </Card>
        <View className="flex-row gap-3">
          <View className="h-16 flex-1 items-center justify-center rounded-xl bg-surface shadow-sm">
            <Text className="text-xs">shadow-sm</Text>
          </View>
          <View className="h-16 flex-1 items-center justify-center rounded-xl bg-surface shadow-sm-strong">
            <Text className="text-xs">shadow-sm-strong</Text>
          </View>
        </View>
      </Section>

      <Section title="Sheet">
        <Button label="Open sheet" variant="secondary" onPress={() => setSheet(true)} />
      </Section>

      <Sheet visible={sheet} title="AR Try On" onClose={() => setSheet(false)}>
        <Text className="mb-4 text-muted">Bottom sheet content goes here.</Text>
        <Button label="Done" arrow onPress={() => setSheet(false)} />
      </Sheet>
    </Screen>
  );
}
