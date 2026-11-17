import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { BrandStore, categoriesFor } from '@/components/store/BrandStore';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Image } from '@/components/ui/Image';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { pickShopImage } from '@/components/vendor/pickShopImage';
import { APPLICATION_CATEGORIES } from '@/lib/vendorApplication';
import { GENDER_OPTIONS, type BasicsErrors, type GenderFocus, type Readiness, type Shop, type ShopImageKind } from '@/lib/shop';
import { colors } from '@/theme';

// Presentational only. State, saving and rules live in the shop screen and lib/shop.ts, so a design pass can
// restyle this file without touching logic.

export type ShopDraft = {
  name: string;
  slug: string;
  description: string;
  city: string;
  categories: string[];
  gender: GenderFocus;
};
type Set = (patch: Partial<ShopDraft>) => void;

export const SHOP_STEPS = ['Basics', 'Branding', 'Details', 'Review'] as const;

export function Stepper({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <View accessibilityRole="tablist" className="flex-row gap-2">
      {SHOP_STEPS.map((label, i) => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityLabel={`Step ${i + 1}, ${label}`}
          accessibilityState={{ selected: i === step }}
          onPress={() => onGo(i)}
          className="min-h-11 flex-1 justify-center gap-1">
          <View className={`h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-strong'}`} />
          <Text weight={i === step ? 'bold' : 'regular'} className="text-xs">
            {i + 1}. {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export type SlugState = 'same' | 'checking' | 'available' | 'taken' | 'error';

export function BasicsStep({
  draft,
  errors,
  slugState,
  set,
  onName,
}: {
  draft: ShopDraft;
  errors: BasicsErrors;
  slugState: SlugState;
  set: Set;
  onName: (name: string) => void;
}) {
  const slugNote =
    slugState === 'checking'
      ? 'Checking…'
      : slugState === 'available'
        ? 'Available'
        : slugState === 'error'
          ? 'Could not check right now.'
          : undefined;
  return (
    <View className="gap-4">
      <Input label="Shop name" value={draft.name} onChangeText={onName} error={errors.name} maxLength={80} autoCapitalize="words" />
      <Input
        label="Shop address"
        value={draft.slug}
        onChangeText={(slug) => set({ slug: slug.toLowerCase() })}
        error={errors.slug ?? (slugState === 'taken' ? 'That address is already taken.' : undefined)}
        helper={slugNote ?? 'Made from your shop name. Lowercase letters, numbers and dashes.'}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={60}
      />
      <View className="gap-1">
        <Text>Description (optional)</Text>
        <TextInput
          accessibilityLabel="Description"
          value={draft.description}
          onChangeText={(description) => set({ description })}
          multiline
          maxLength={1000}
          textAlignVertical="top"
          placeholderTextColor={colors.muted}
          className="h-28 rounded-md border border-line bg-surface p-4 font-sans text-sm text-ink"
        />
        {errors.description ? (
          <Text accessibilityRole="alert" className="text-xs text-danger">
            {errors.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** One image slot. Picking shows a preview and the compressed size first; nothing uploads until the vendor confirms. */
function ImageSlot({
  kind,
  label,
  url,
  onUpload,
  onRemove,
}: {
  kind: ShopImageKind;
  label: string;
  url: string | null;
  onUpload: (uri: string) => Promise<string | undefined>;
  onRemove: () => Promise<string | undefined>;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [kb, setKb] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Called straight from the press handler: web browsers only open the file chooser from inside a tap.
  const pick = () => {
    setError(undefined);
    void pickShopImage(kind).then((uri) => {
      if (!uri) return;
      setPending(uri);
      setKb(null);
      void fetch(uri)
        .then((r) => r.blob())
        .then((b) => setKb(Math.max(1, Math.round(b.size / 1024))))
        .catch(() => undefined);
    });
  };
  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    const err = await onUpload(pending);
    setBusy(false);
    if (err) setError(err);
    else setPending(null);
  };
  const shown = pending ?? url;
  const shape = kind === 'logo' ? 'h-28 w-28 rounded-full' : 'aspect-[8/3] w-full max-w-[480px] rounded-xl';

  return (
    <View className="gap-2">
      <Text weight="medium">{label}</Text>
      {shown ? (
        <Image source={{ uri: shown }} accessibilityLabel={pending ? `${label} preview` : label} contentFit="cover" className={`${shape} bg-card`} />
      ) : (
        <View className={`${shape} items-center justify-center border border-dashed border-muted`}>
          <Text className="text-primary-hover">{kind === 'logo' ? 'Square' : 'Wide'}</Text>
        </View>
      )}
      {pending ? (
        <View className="gap-2">
          <Text className="text-primary-hover">
            Cropped and compressed{kb ? ` to ${kb} KB` : ''}. Use this one?
          </Text>
          <View className="flex-row gap-2">
            <Button fullWidth={false} label="Use this image" loading={busy} onPress={confirm} />
            <Button fullWidth={false} variant="secondary" label="Choose another" disabled={busy} onPress={pick} />
          </View>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <Button fullWidth={false} variant="secondary" label={url ? `Change ${kind}` : `Add ${kind}`} onPress={pick} />
          {url ? (
            <Button
              fullWidth={false}
              variant="ghost"
              label="Remove"
              loading={busy}
              onPress={async () => {
                setBusy(true);
                setError((await onRemove()) ?? undefined);
                setBusy(false);
              }}
            />
          ) : null}
        </View>
      )}
      {error ? (
        <Text accessibilityRole="alert" className="text-xs text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function BrandingStep({
  shop,
  onUpload,
  onRemove,
}: {
  shop: Shop;
  onUpload: (kind: ShopImageKind, uri: string) => Promise<string | undefined>;
  onRemove: (kind: ShopImageKind) => Promise<string | undefined>;
}) {
  return (
    <View className="gap-6">
      <ImageSlot kind="logo" label="Logo" url={shop.logo_url} onUpload={(u) => onUpload('logo', u)} onRemove={() => onRemove('logo')} />
      <ImageSlot kind="banner" label="Banner" url={shop.banner_url} onUpload={(u) => onUpload('banner', u)} onRemove={() => onRemove('banner')} />
    </View>
  );
}

export function DetailsStep({ draft, errors, set }: { draft: ShopDraft; errors: BasicsErrors; set: Set }) {
  const toggle = (id: string) =>
    set({ categories: draft.categories.includes(id) ? draft.categories.filter((c) => c !== id) : [...draft.categories, id] });
  return (
    <View className="gap-6">
      <Input label="City" value={draft.city} onChangeText={(city) => set({ city })} error={errors.city} maxLength={60} />
      <View className="gap-2">
        <Text>Categories</Text>
        <View className="flex-row flex-wrap gap-2">
          {APPLICATION_CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.label} selected={draft.categories.includes(c.id)} onPress={() => toggle(c.id)} />
          ))}
        </View>
        {errors.categories ? (
          <Text accessibilityRole="alert" className="text-xs text-danger">
            {errors.categories}
          </Text>
        ) : null}
      </View>
      <View className="gap-2">
        <Text>Who do you sell to?</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Gender focus" className="flex-row flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <Chip key={g.id} label={g.label} selected={draft.gender === g.id} onPress={() => set({ gender: g.id })} />
          ))}
        </View>
      </View>
    </View>
  );
}

/** The real brand store screen, fed with the draft. Phone-sized, with nothing in it to leave the page. */
export function ShopPreview({ shop, draft }: { shop: Shop; draft: ShopDraft }) {
  return (
    <View className="gap-2">
      <Text weight="medium">Preview</Text>
      <Text className="text-primary-hover">This is the store screen shoppers will see. Your products appear once you add them.</Text>
      <View
        accessibilityLabel="Shop preview"
        className="h-[680px] w-full max-w-[390px] self-center overflow-hidden rounded-[28px] border border-line bg-surface">
        <BrandStore
          embedded
          name={draft.name.trim() || 'Your shop'}
          products={[]}
          categories={categoriesFor(draft.categories)}
          genderFocus={draft.gender}
          about={{ description: draft.description.trim() || null, city: draft.city.trim() || null, logoUrl: shop.logo_url, bannerUrl: shop.banner_url }}
        />
      </View>
    </View>
  );
}

export function PublishPanel({
  live,
  readiness,
  busy,
  error,
  onPublish,
  onUnpublish,
}: {
  live: boolean;
  readiness: Readiness;
  busy: boolean;
  error?: string;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const blocked = readiness.missing.length > 0;
  return (
    <View className="gap-3 rounded-xl bg-card p-4">
      {live ? (
        <>
          <Text weight="medium" className="text-lg">
            Your shop is live
          </Text>
          <Text>Shoppers can see it now. Changes you save show up straight away.</Text>
          <Button variant="secondary" fullWidth={false} label="Take shop offline" loading={busy} onPress={onUnpublish} />
        </>
      ) : (
        <>
          <Text weight="medium" className="text-lg">
            {blocked ? 'Not ready to go live yet' : 'Ready to go live'}
          </Text>
          {blocked ? (
            <View accessibilityRole="alert" className="gap-1">
              <Text>Still needed:</Text>
              {readiness.missing.map((m) => (
                <Text key={m}>• {m}</Text>
              ))}
            </View>
          ) : (
            <Text>Everything required is in place.</Text>
          )}
          {readiness.suggestions.length ? (
            <View className="gap-1">
              <Text className="text-primary-hover">Worth adding (optional):</Text>
              {readiness.suggestions.map((m) => (
                <Text key={m} className="text-primary-hover">
                  • {m}
                </Text>
              ))}
            </View>
          ) : null}
          <Button arrow label="Publish shop" disabled={blocked} loading={busy} onPress={onPublish} />
        </>
      )}
      {error ? (
        <Text accessibilityRole="alert" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** "Saving…" / "Saved" for drafts. Announced politely to screen readers. */
export function SaveStatus({ state }: { state: 'idle' | 'saving' | 'saved' | 'error' }) {
  const text = state === 'saving' ? 'Saving…' : state === 'saved' ? 'Draft saved' : state === 'error' ? 'Could not save. Your changes are still here.' : '';
  return (
    <Text accessibilityLiveRegion="polite" className={`text-xs ${state === 'error' ? 'text-danger' : 'text-primary-hover'}`}>
      {text}
    </Text>
  );
}

