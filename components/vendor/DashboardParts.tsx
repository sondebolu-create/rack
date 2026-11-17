import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/Text';

// Presentational pieces for the vendor dashboard.

export function StatCard({ label, value, onPress }: { label: string; value: number; onPress?: () => void }) {
  const body = (
    <View className="min-h-[88px] justify-between rounded-xl bg-card p-4">
      <Text className="text-primary-hover">{label}</Text>
      <Text weight="bold" className="text-2xl">
        {value}
      </Text>
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="link" accessibilityLabel={`${label}: ${value}`} onPress={onPress} className="min-w-[140px] flex-1 hover:opacity-80">
      {body}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={`${label}: ${value}`} className="min-w-[140px] flex-1">
      {body}
    </View>
  );
}

export function Section({ title, action, children }: { title: string; action?: { label: string; onPress: () => void }; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text weight="medium" accessibilityRole="header" className="text-lg">
          {title}
        </Text>
        {action ? (
          <Pressable accessibilityRole="link" accessibilityLabel={action.label} onPress={action.onPress} className="min-h-11 justify-center">
            <Text weight="medium" className="underline">
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export type ChecklistItem = { label: string; hint?: string; done: boolean; onPress: () => void };

/** Setup steps shown while the shop is still a draft. */
export function SetupChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <View className="gap-2">
      {items.map((it, i) => (
        <Pressable
          key={it.label}
          accessibilityRole="link"
          accessibilityLabel={`Step ${i + 1}: ${it.label}${it.done ? ', done' : ''}`}
          onPress={it.onPress}
          className="min-h-11 flex-row items-center gap-3 rounded-xl border border-line p-4 hover:bg-card">
          <View className={`h-6 w-6 items-center justify-center rounded-full ${it.done ? 'bg-primary' : 'border border-muted'}`}>
            {it.done ? <Text className="text-xs text-inverse">✓</Text> : <Text className="text-xs">{i + 1}</Text>}
          </View>
          <View className="flex-1">
            <Text weight="medium" className={it.done ? 'line-through' : ''}>
              {it.label}
            </Text>
            {it.hint ? <Text className="text-xs text-primary-hover">{it.hint}</Text> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function LowStockRow({
  name,
  size,
  colour,
  stock,
  onEdit,
}: {
  name: string;
  size: string;
  colour: string;
  stock: number;
  onEdit: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-xl border border-line p-3">
      <View className="flex-1">
        <Text weight="medium">{name}</Text>
        <Text className="text-xs text-primary-hover">
          Size {size} · {colour}
        </Text>
      </View>
      <Text weight="medium">{stock === 0 ? 'Sold out' : `${stock} left`}</Text>
      <Pressable accessibilityRole="link" accessibilityLabel={`Edit ${name}`} onPress={onEdit} className="min-h-11 justify-center rounded-md border border-line px-3 hover:bg-card">
        <Text weight="medium" className="text-xs">
          Edit
        </Text>
      </Pressable>
    </View>
  );
}

