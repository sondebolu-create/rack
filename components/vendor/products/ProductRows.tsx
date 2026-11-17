import { Pressable, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatPrice, type Currency } from '@/lib/format';
import { coverUrl, isLowStock, totalStock, type ListedProduct, type ProductStatus } from '@/lib/products';
import { categoryLabel } from '@/lib/vendorApplication';

// Presentational: a table at 1024px and wider, a list of cards below. Logic lives in the products screen.

export const STATUS_FILTERS: { id: ProductStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
];

export function StatusFilterChips({ value, onChange }: { value: ProductStatus | 'all'; onChange: (v: ProductStatus | 'all') => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Filter by status" className="flex-row flex-wrap gap-2">
      {STATUS_FILTERS.map((f) => (
        <Chip key={f.id} label={f.label} selected={value === f.id} onPress={() => onChange(f.id)} />
      ))}
    </View>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const tone = status === 'published' ? 'bg-primary' : status === 'archived' ? 'bg-strong' : 'bg-card border border-line';
  return (
    <View className={`self-start rounded-full px-3 py-1 ${tone}`}>
      <Text weight="medium" className={`text-xs capitalize ${status === 'published' ? 'text-inverse' : ''}`}>
        {status}
      </Text>
    </View>
  );
}

const COLS = 'lg:flex-row lg:items-center lg:gap-4';
const W = ['lg:w-14', 'lg:flex-[2]', 'lg:flex-1', 'lg:flex-1', 'lg:flex-1', 'lg:flex-[2.2]'];

export function ProductTableHeader() {
  return (
    <View className={`hidden border-b border-line pb-2 ${COLS} lg:flex`}>
      {['', 'Product', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
        <Text key={i} weight="medium" className={`text-primary-hover ${W[i]}`}>
          {h}
        </Text>
      ))}
    </View>
  );
}

export type RowActions = {
  onEdit: () => void;
  onDuplicate: () => void;
  onTogglePublish: () => void;
  onArchive: () => void;
};

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-md border border-line px-3 hover:bg-card active:bg-card ${disabled ? 'opacity-50' : ''}`}>
      <Text weight="medium" className="text-xs">
        {label.split(' ')[0]}
      </Text>
    </Pressable>
  );
}

export function ProductRowView({ product, busy, actions }: { product: ListedProduct; busy: boolean; actions: RowActions }) {
  const cover = coverUrl(product);
  const stock = totalStock(product);
  const low = isLowStock(product);
  const isPublished = product.status === 'published';
  const isArchived = product.status === 'archived';
  return (
    // A View, not a Pressable: the row holds several buttons, and buttons can't nest.
    <View className={`gap-3 rounded-xl border border-line p-3 ${COLS} lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3`}>
      <View className={`flex-row items-center gap-3 lg:contents`}>
        <View className={`h-16 w-12 overflow-hidden rounded-md bg-card ${W[0]} lg:h-[72px] lg:w-14`}>
          {cover ? <Image source={{ uri: cover }} accessibilityLabel={`${product.name} photo`} contentFit="cover" className="h-full w-full" /> : null}
        </View>
        <View className={`flex-1 gap-0.5 ${W[1]}`}>
          <Pressable accessibilityRole="link" accessibilityLabel={`Edit ${product.name}`} onPress={actions.onEdit} className="min-h-11 justify-center">
            <Text weight="medium">{product.name}</Text>
          </Pressable>
          <Text className="text-xs text-primary-hover">{categoryLabel(product.category)}</Text>
        </View>
      </View>
      <View className={`flex-row items-center justify-between gap-2 ${W[2]} lg:contents`}>
        <Text weight="medium" className={W[2]}>
          {formatPrice(product.price_minor, product.currency as Currency)}
        </Text>
        <View className={`flex-row flex-wrap items-center gap-2 ${W[3]}`}>
          <Text>{stock === 0 ? 'Sold out' : `${stock} in stock`}</Text>
          {low && stock > 0 ? (
            <View accessibilityLabel="Low stock" className="rounded-full bg-strong px-2 py-0.5">
              <Text weight="medium" className="text-xs">
                Low stock
              </Text>
            </View>
          ) : null}
        </View>
        <View className={W[4]}>
          <StatusBadge status={product.status} />
        </View>
      </View>
      <View className={`flex-row flex-wrap gap-2 ${W[5]}`}>
        <ActionButton label={`Edit ${product.name}`} onPress={actions.onEdit} disabled={busy} />
        <ActionButton label={`Duplicate ${product.name}`} onPress={actions.onDuplicate} disabled={busy} />
        {!isArchived ? (
          <ActionButton label={`${isPublished ? 'Unpublish' : 'Publish'} ${product.name}`} onPress={actions.onTogglePublish} disabled={busy} />
        ) : null}
        <ActionButton label={`${isArchived ? 'Restore' : 'Archive'} ${product.name}`} onPress={actions.onArchive} disabled={busy} />
      </View>
    </View>
  );
}
