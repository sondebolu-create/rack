import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gate } from '@/components/auth/Gate';
import { VendorShell } from '@/components/auth/VendorShell';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import {
  BasicsStep,
  BrandingStep,
  DetailsStep,
  PublishPanel,
  SaveStatus,
  ShopPreview,
  Stepper,
  SHOP_STEPS,
  type ShopDraft,
  type SlugState,
} from '@/components/vendor/ShopSteps';
import {
  SLUG_RE,
  publishReadiness,
  publishShop,
  removeShopImage,
  saveShop,
  slugAvailable,
  slugify,
  unpublishShop,
  uploadShopImage,
  useMyShop,
  validateShop,
  type BasicsErrors,
  type Shop,
  type ShopPatch,
} from '@/lib/shop';
import { colors } from '@/theme';

const toDraft = (s: Shop): ShopDraft => ({
  name: s.name,
  slug: s.slug,
  description: s.description ?? '',
  city: s.city ?? '',
  categories: s.categories,
  gender: s.gender_focus,
});

/** Which fields differ from the saved row AND are valid to save. Invalid ones stay local until fixed. */
function patchFor(shop: Shop, d: ShopDraft, slugOk: boolean): ShopPatch {
  const p: ShopPatch = {};
  const name = d.name.trim();
  if (name && name.length <= 80 && name !== shop.name) p.name = name;
  if (SLUG_RE.test(d.slug) && slugOk && d.slug !== shop.slug) p.slug = d.slug;
  if (d.description.length <= 1000 && (d.description.trim() || null) !== shop.description) p.description = d.description.trim() || null;
  const city = d.city.trim();
  if (city.length <= 60 && (city || null) !== shop.city) p.city = city || null;
  if (JSON.stringify(d.categories) !== JSON.stringify(shop.categories)) p.categories = d.categories;
  if (d.gender !== shop.gender_focus) p.gender_focus = d.gender;
  return p;
}

/** V2 Shop setup and editing. Vendors only. */
export default function VendorShopPage() {
  return (
    <Gate need="vendor">
      <VendorShell title="Shop">
        <ShopLoader />
      </VendorShell>
    </Gate>
  );
}

function ShopLoader() {
  const { shop, publishedCount, loading, failed, reload } = useMyShop();
  if (loading) return <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />;
  if (failed) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className="text-danger">
          Could not load your shop.
        </Text>
        <Button variant="secondary" fullWidth={false} label="Try again" onPress={reload} />
      </View>
    );
  }
  if (!shop) return <Text>Your shop is created when your application is approved. If you were just approved, reload this page.</Text>;
  return <ShopEditor key={shop.id} initial={shop} publishedCount={publishedCount} />;
}

function ShopEditor({ initial, publishedCount }: { initial: Shop; publishedCount: number }) {
  const router = useRouter();
  const { step: stepParam } = useLocalSearchParams<{ step?: string }>();
  // The step lives in the URL, so a refresh comes back to the same screen. The data lives on the shops row.
  const step = Math.min(Math.max(Number(stepParam) || 0, 0), SHOP_STEPS.length - 1);
  const go = (i: number) => router.setParams({ step: String(i) });

  const [shop, setShop] = useState(initial); // the saved row
  const [draft, setDraft] = useState<ShopDraft>(() => toDraft(initial));
  const [slugState, setSlugState] = useState<SlugState>('same');
  const [errors, setErrors] = useState<BasicsErrors>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [publishError, setPublishError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const live = shop.status === 'live';
  const slugChanged = draft.slug !== shop.slug;
  const slugShown: SlugState = slugChanged ? slugState : 'same';

  const set = (patch: Partial<ShopDraft>) => {
    if (patch.slug !== undefined && patch.slug !== shop.slug && SLUG_RE.test(patch.slug)) setSlugState('checking');
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({});
  };
  // The address follows the name until the vendor edits it themselves.
  const onName = (name: string) => set({ name, ...(draft.slug === slugify(draft.name) ? { slug: slugify(name) } : {}) });

  // Is the typed address free? Debounced; the server also refuses duplicates on save.
  useEffect(() => {
    if (!slugChanged || !SLUG_RE.test(draft.slug)) return;
    let stale = false;
    const t = setTimeout(async () => {
      const ok = await slugAvailable(draft.slug, shop.id);
      if (!stale) setSlugState(ok === null ? 'error' : ok ? 'available' : 'taken');
    }, 400);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [draft.slug, slugChanged, shop.id]);

  const patch = patchFor(shop, draft, slugShown === 'available');
  const dirty = Object.keys(patch).length > 0;

  const persist = async () => {
    setSaveState('saving');
    const r = await saveShop(shop.id, patch);
    if (r.shop) {
      setShop(r.shop);
      setSaveState('saved');
    } else setSaveState('error');
    return r;
  };

  // Drafts save themselves as the vendor goes. A live shop only changes when they press Save, so a half-typed
  // name is never shown to shoppers.
  useEffect(() => {
    if (live || !dirty) return;
    const t = setTimeout(() => void persist(), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, dirty, JSON.stringify(patch)]);

  const next = () => {
    const e = validateShop({ ...shop, ...draft, description: draft.description });
    const here: BasicsErrors =
      step === 0 ? { name: e.name, slug: e.slug, description: e.description } : step === 2 ? { city: e.city, categories: e.categories } : {};
    const found = Object.fromEntries(Object.entries(here).filter(([, v]) => v)) as BasicsErrors;
    if (step === 0 && slugShown === 'taken') found.slug = 'That address is already taken.';
    setErrors(found);
    if (Object.keys(found).length === 0) go(step + 1);
  };

  const upload = async (kind: 'logo' | 'banner', uri: string) => {
    const r = await uploadShopImage(shop, kind, uri);
    if (r.shop) setShop(r.shop);
    return r.error;
  };
  const remove = async (kind: 'logo' | 'banner') => {
    const r = await removeShopImage(shop, kind);
    if (r.shop) setShop(r.shop);
    return r.error;
  };

  const publish = async () => {
    setBusy(true);
    setPublishError(undefined);
    if (dirty) await persist();
    const r = await publishShop(shop.id);
    if (r.shop) setShop(r.shop);
    else setPublishError(r.error);
    setBusy(false);
  };
  const unpublish = async () => {
    setBusy(true);
    const r = await unpublishShop(shop.id);
    if (r.shop) setShop(r.shop);
    else setPublishError(r.error);
    setBusy(false);
  };

  const readiness = publishReadiness({ ...shop, ...draft, description: draft.description, city: draft.city, categories: draft.categories, slug: draft.slug, name: draft.name }, publishedCount);
  const preview = <ShopPreview shop={shop} draft={draft} />;

  return (
    <View className="gap-6 lg:flex-row lg:items-start lg:gap-9">
      <View className="w-full max-w-[480px] gap-6">
        <Stepper step={step} onGo={go} />
        <View className="gap-1">
          <Text weight="medium" accessibilityRole="header" className="text-xl">
            {SHOP_STEPS[step]}
          </Text>
          {live ? (
            <Text className="text-primary-hover">Your shop is live. Press Save to publish your changes.</Text>
          ) : (
            <SaveStatus state={saveState} />
          )}
        </View>

        {step === 0 ? <BasicsStep draft={draft} errors={errors} slugState={slugShown} set={set} onName={onName} /> : null}
        {step === 1 ? <BrandingStep shop={shop} onUpload={upload} onRemove={remove} /> : null}
        {step === 2 ? <DetailsStep draft={draft} errors={errors} set={set} /> : null}
        {step === 3 ? (
          <>
            {/* Below desktop width the preview is its own step; from 1024px it sits beside the form on every step. */}
            <View className="lg:hidden">{preview}</View>
            <PublishPanel live={live} readiness={readiness} busy={busy} error={publishError} onPublish={publish} onUnpublish={unpublish} />
          </>
        ) : null}

        {live && dirty ? (
          <Button
            label="Save changes"
            loading={saveState === 'saving'}
            disabled={slugShown === 'checking' || slugShown === 'taken'}
            onPress={() => void persist()}
          />
        ) : null}
        {live && saveState === 'saved' && !dirty ? <SaveStatus state="saved" /> : null}
        {live && saveState === 'error' ? <SaveStatus state="error" /> : null}

        <View className="flex-row gap-3">
          {step > 0 ? <Button fullWidth={false} variant="secondary" label="Back" onPress={() => go(step - 1)} /> : null}
          {step < SHOP_STEPS.length - 1 ? <Button fullWidth={false} arrow label="Continue" onPress={next} /> : null}
        </View>
      </View>

      <View className="hidden w-full max-w-[420px] lg:flex">{preview}</View>
    </View>
  );
}
