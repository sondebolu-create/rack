import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, TextInput, View } from 'react-native';
import { useNavigation, usePreventRemove, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { PhotoGrid } from '@/components/vendor/products/PhotoGrid';
import { VariantEditor } from '@/components/vendor/products/VariantEditor';
import { pickSamplePhoto } from '@/components/vendor/pickSamplePhoto';
import {
  MAX_PHOTOS,
  emptyForm,
  formatNairaInput,
  newKey,
  saveProduct,
  toForm,
  validateProduct,
  type FormErrors,
  type ListedProduct,
  type ProductForm,
  type SaveTarget,
} from '@/lib/products';
import { GENDER_OPTIONS, type Shop } from '@/lib/shop';
import { APPLICATION_CATEGORIES } from '@/lib/vendorApplication';
import { colors } from '@/theme';

/** What counts as "changed": everything the vendor can edit, except upload progress. */
const snapshot = (f: ProductForm) =>
  JSON.stringify({ ...f, photos: f.photos.map((p) => [p.uri, p.remote]) });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text weight="medium" accessibilityRole="header" className="text-lg">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Add or edit one product. `product` is null for a new one. */
export function ProductEditor({ shop, product }: { shop: Shop; product: ListedProduct | null }) {
  const router = useRouter();
  const navigation = useNavigation();
  const [form, setForm] = useState<ProductForm>(() => (product ? toForm(product) : emptyForm(shop.gender_focus)));
  const [saved, setSaved] = useState(() => snapshot(product ? toForm(product) : emptyForm(shop.gender_focus)));
  const [productId, setProductId] = useState<string | null>(product?.id ?? null);
  const [status, setStatus] = useState(product?.status ?? 'draft');
  const [errors, setErrors] = useState<FormErrors>({});
  const [banner, setBanner] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState<{ type: string } | null>(null);
  // Set by "Discard changes": lets the held navigation through.
  const [discard, setDiscard] = useState<{ type: string } | null>(null);
  const lastTarget = useRef<SaveTarget>('draft');

  const dirty = useMemo(() => snapshot(form) !== saved, [form, saved]);
  const categories = useMemo(() => {
    const own = APPLICATION_CATEGORIES.filter((c) => shop.categories.includes(c.id));
    return own.length ? own : APPLICATION_CATEGORIES;
  }, [shop.categories]);

  // Leaving with unsaved changes: ask first. In-app navigation is caught here; closing the tab or refreshing
  // is caught by the browser's own prompt (below).
  usePreventRemove(dirty && !done && !discard, ({ data }) => setLeaving(data.action));
  useEffect(() => {
    if (Platform.OS !== 'web' || !dirty || done) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, done]);
  useEffect(() => {
    if (discard) navigation.dispatch(discard as never);
  }, [discard, navigation]);
  // Navigate away after a successful save, once `dirty` has cleared so the guard lets it through.
  useEffect(() => {
    if (done) router.replace('/vendor/products');
  }, [done, router]);

  const set = (patch: Partial<ProductForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
    setBanner(undefined);
  };

  const addPhoto = () => {
    // Called straight from the press handler: web browsers only open the file chooser from inside a tap.
    void pickSamplePhoto(1600).then((uri) => {
      if (uri) setForm((f) => ({ ...f, photos: [...f.photos, { key: newKey(), uri, remote: false, state: 'ready' as const }].slice(0, MAX_PHOTOS) }));
    });
  };

  const save = async (target: SaveTarget) => {
    lastTarget.current = target;
    const publishing = target === 'published' || (target === 'keep' && status === 'published');
    const found = validateProduct(form, publishing);
    setErrors(found);
    if (Object.keys(found).length) {
      setBanner('Fix the highlighted fields.');
      return;
    }
    setSaving(true);
    setBanner(undefined);
    const r = await saveProduct(shop.id, productId, status, form, target, (key, state, finalUri) =>
      setForm((f) => ({
        ...f,
        photos: f.photos.map((p) => (p.key === key ? { ...p, state, ...(finalUri ? { uri: finalUri, remote: true } : {}) } : p)),
      })),
    );
    setSaving(false);
    if (r.id) setProductId(r.id);
    if (r.error) {
      setBanner(r.error);
      return;
    }
    setStatus(target === 'keep' ? status : target);
    setSaved(snapshot(form)); // approximate; refreshed below once the uploads have swapped in their URLs
    setDone(true);
  };

  const price = (
    <Input
      label="Price (₦)"
      accessibilityLabel="Price in naira"
      value={form.priceText}
      onChangeText={(t) => set({ priceText: formatNairaInput(t) })}
      error={errors.price}
      keyboardType="number-pad"
      placeholder="0"
      helper="Whole naira, for example 25,000"
    />
  );

  const publishedNow = status === 'published';
  return (
    <View className="w-full max-w-[720px] gap-8">
      {banner ? (
        <Text accessibilityRole="alert" className="text-danger">
          {banner}
        </Text>
      ) : null}

      <Section title="Photos">
        <Text className="text-primary-hover">Up to {MAX_PHOTOS}. They are resized and compressed before upload.</Text>
        <PhotoGrid photos={form.photos} max={MAX_PHOTOS} disabled={saving} onChange={(photos) => set({ photos })} onAdd={addPhoto} onRetry={() => void save(lastTarget.current)} />
        {errors.photos ? (
          <Text accessibilityRole="alert" className="text-xs text-danger">
            {errors.photos}
          </Text>
        ) : null}
      </Section>

      <Section title="Details">
        <Input label="Product name" value={form.name} onChangeText={(name) => set({ name })} error={errors.name} maxLength={120} autoCapitalize="words" />
        <View className="gap-1">
          <Text>Description (optional)</Text>
          <TextInput
            accessibilityLabel="Description"
            value={form.description}
            onChangeText={(description) => set({ description })}
            multiline
            maxLength={2000}
            textAlignVertical="top"
            placeholderTextColor={colors.muted}
            className="h-28 rounded-md border border-line bg-surface p-4 font-sans text-sm text-ink"
          />
        </View>
        <View className="gap-2">
          <Text>Category</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Category" className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c.id} label={c.label} selected={form.category === c.id} onPress={() => set({ category: c.id })} />
            ))}
          </View>
          {errors.category ? (
            <Text accessibilityRole="alert" className="text-xs text-danger">
              {errors.category}
            </Text>
          ) : null}
        </View>
        <View className="gap-2">
          <Text>Gender</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Gender" className="flex-row flex-wrap gap-2">
            {GENDER_OPTIONS.map((g) => (
              <Chip key={g.id} label={g.label} selected={form.gender === g.id} onPress={() => set({ gender: g.id })} />
            ))}
          </View>
        </View>
        {price}
      </Section>

      <Section title="Sizes, colours and stock">
        <VariantEditor form={form} disabled={saving} set={set} error={errors.variants} coloursError={errors.colours} />
      </Section>

      <View className="gap-3 pb-8">
        {publishedNow || status === 'archived' ? (
          <>
            <Button label="Save changes" arrow loading={saving} onPress={() => void save('keep')} />
            <Button variant="secondary" label={status === 'archived' ? 'Restore as draft' : 'Unpublish and save as draft'} disabled={saving} onPress={() => void save('draft')} />
          </>
        ) : (
          <>
            <Button label="Publish" arrow loading={saving} onPress={() => void save('published')} />
            <Button variant="secondary" label="Save as draft" disabled={saving} onPress={() => void save('draft')} />
          </>
        )}
        <Button variant="ghost" label="Cancel" disabled={saving} onPress={() => router.back()} />
        {!shop.status || shop.status !== 'live' ? (
          <Text className="text-xs text-primary-hover">Shoppers see published products once your shop is live. Publish your shop from the Shop page.</Text>
        ) : null}
      </View>

      {/* Our own dialog: Alert doesn't exist on web. */}
      <Modal visible={leaving !== null} transparent animationType="fade" onRequestClose={() => setLeaving(null)}>
        <View className="flex-1 items-center justify-center bg-ink/60 p-4">
          <View accessibilityViewIsModal className="w-full max-w-[400px] gap-4 rounded-xl bg-surface p-6">
            <Text weight="medium" accessibilityRole="header" className="text-lg">
              Leave without saving?
            </Text>
            <Text>You have changes that are not saved. They will be lost.</Text>
            <Button label="Keep editing" onPress={() => setLeaving(null)} />
            <Button
              variant="secondary"
              label="Discard changes"
              onPress={() => {
                setDiscard(leaving);
                setLeaving(null);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
