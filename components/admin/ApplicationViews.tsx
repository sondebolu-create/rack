import { Linking, Pressable, View } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatDate } from '@/lib/format';
import { categoryLabel, instagramUrl, type ApplicationRow, type ApplicationStatus } from '@/lib/vendorApplication';

// Presentational pieces for the admin pages. Logic stays in lib/vendorApplication.ts and the route files.

export const FILTERS: { id: ApplicationStatus | 'all'; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

export function StatusFilter({
  value,
  onChange,
}: {
  value: ApplicationStatus | 'all';
  onChange: (v: ApplicationStatus | 'all') => void;
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Filter by status" className="flex-row flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Chip key={f.id} label={f.label} selected={value === f.id} onPress={() => onChange(f.id)} />
      ))}
    </View>
  );
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const tone = status === 'approved' ? 'bg-primary' : status === 'rejected' ? 'bg-strong' : 'bg-card border border-line';
  return (
    <View className={`self-start rounded-full px-3 py-1 ${tone}`}>
      <Text weight="medium" className={`text-xs capitalize ${status === 'approved' ? 'text-inverse' : ''}`}>
        {status}
      </Text>
    </View>
  );
}

export function InstagramLink({ handle }: { handle: string | null }) {
  if (!handle) return <Text className="text-primary-hover">None</Text>;
  const url = instagramUrl(handle);
  if (!url) return <Text>{handle}</Text>; // never build a link from an unvalidated handle
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Instagram, @${handle}`}
      onPress={() => void Linking.openURL(url)}
      className="min-h-11 justify-center">
      <Text className="text-interactive underline">@{handle}</Text>
    </Pressable>
  );
}

export function PhotoStrip({ paths, urls, size = 'sm' }: { paths: string[]; urls: Record<string, string>; size?: 'sm' | 'lg' }) {
  if (!paths.length) return <Text className="text-primary-hover">No photos</Text>;
  const dims = size === 'lg' ? 'h-48 w-40' : 'h-14 w-11';
  return (
    <View className="flex-row flex-wrap gap-2">
      {paths.map((p, i) => (
        <Image
          key={p}
          source={urls[p] ? { uri: urls[p] } : undefined}
          accessibilityLabel={`Sample photo ${i + 1}`}
          contentFit="cover"
          className={`${dims} rounded-md bg-card`}
        />
      ))}
    </View>
  );
}

const COLS = 'lg:flex-row lg:items-center lg:gap-4';

/** Header row of the table. Only shown from desktop width; below that each row is a labelled card. */
export function TableHeader() {
  return (
    <View className={`hidden border-b border-line pb-2 ${COLS} lg:flex`}>
      {['Business', 'Instagram', 'City', 'Categories', 'Photos', 'Submitted', ''].map((h, i) => (
        <Text key={i} weight="medium" className={`text-primary-hover ${COLS_W[i]}`}>
          {h}
        </Text>
      ))}
    </View>
  );
}

const COLS_W = ['lg:flex-[2]', 'lg:flex-[1.4]', 'lg:flex-1', 'lg:flex-[1.6]', 'lg:flex-[1.4]', 'lg:flex-1', 'lg:w-24'];

export function ApplicationRowView({
  app,
  urls,
  onOpen,
}: {
  app: ApplicationRow;
  urls: Record<string, string>;
  onOpen: () => void;
}) {
  return (
    // A View, not a Pressable: the row holds its own link and button, and buttons can't nest.
    <View className={`gap-2 rounded-xl border border-line p-4 ${COLS} lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3`}>
      <View className={`gap-1 ${COLS_W[0]}`}>
        <Pressable accessibilityRole="link" accessibilityLabel={`Review ${app.business_name}`} onPress={onOpen} className="min-h-11 justify-center">
          <Text weight="medium">{app.business_name}</Text>
        </Pressable>
        <StatusBadge status={app.status} />
      </View>
      <View className={COLS_W[1]}>
        <InstagramLink handle={app.instagram_handle} />
      </View>
      <Text className={COLS_W[2]}>{app.city}</Text>
      <Text className={COLS_W[3]}>{app.categories.map(categoryLabel).join(', ') || 'None'}</Text>
      <View className={COLS_W[4]}>
        <PhotoStrip paths={app.sample_photo_urls} urls={urls} />
      </View>
      <Text className={COLS_W[5]}>{formatDate(new Date(app.created_at).getTime())}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${app.business_name}`}
        onPress={onOpen}
        className={`h-11 items-center justify-center rounded-md border border-line px-4 hover:bg-card ${COLS_W[6]}`}>
        <Text weight="medium">Open</Text>
      </Pressable>
    </View>
  );
}
