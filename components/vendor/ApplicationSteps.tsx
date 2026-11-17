import { Pressable, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';
import { pickSamplePhoto } from '@/components/vendor/pickSamplePhoto';
import {
  APPLICATION_CATEGORIES,
  MAX_PHOTOS,
  categoryLabel,
  type ApplicationForm,
  type FormErrors,
} from '@/lib/vendorApplication';

// Presentational only: state and rules live in lib/vendorApplication.ts and the apply screen, so a later
// design pass can restyle this file without touching logic.

export const STEP_TITLES = ['Your business', 'What you sell', 'Sample photos', 'Review and send'] as const;

export function StepProgress({ step }: { step: number }) {
  const total = STEP_TITLES.length;
  return (
    <View className="gap-2">
      <Text className="text-primary-hover">
        Step {step + 1} of {total}
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${step + 1} of ${total}`}
        accessibilityValue={{ min: 1, max: total, now: step + 1 }}
        className="h-1 flex-row overflow-hidden rounded-full bg-strong">
        <View className="bg-primary" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </View>
      <Text weight="medium" accessibilityRole="header" className="mt-2 text-xl">
        {STEP_TITLES[step]}
      </Text>
    </View>
  );
}

type StepProps = {
  form: ApplicationForm;
  errors: FormErrors;
  set: (patch: Partial<ApplicationForm>) => void;
};

export function BusinessStep({ form, errors, set }: StepProps) {
  return (
    <View className="gap-4">
      <Input label="Business name" value={form.businessName} onChangeText={(businessName) => set({ businessName })} error={errors.businessName} autoCapitalize="words" maxLength={100} />
      <Input
        label="Instagram handle (optional)"
        accessibilityLabel="Instagram handle"
        value={form.instagram}
        onChangeText={(instagram) => set({ instagram })}
        error={errors.instagram}
        helper="For example @yourshop"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input label="Phone number" value={form.phone} onChangeText={(phone) => set({ phone })} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" maxLength={20} />
      <Input label="City" value={form.city} onChangeText={(city) => set({ city })} error={errors.city} maxLength={60} />
    </View>
  );
}

export function CategoriesStep({ form, errors, set }: StepProps) {
  const toggle = (id: string) =>
    set({ categories: form.categories.includes(id) ? form.categories.filter((c) => c !== id) : [...form.categories, id] });
  return (
    <View className="gap-3">
      <Text className="text-primary-hover">Choose everything you sell.</Text>
      <View className="flex-row flex-wrap gap-2">
        {APPLICATION_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} selected={form.categories.includes(c.id)} onPress={() => toggle(c.id)} />
        ))}
      </View>
      {errors.categories ? (
        <Text accessibilityRole="alert" className="text-xs text-danger">
          {errors.categories}
        </Text>
      ) : null}
    </View>
  );
}

export function PhotosStep({ form, errors, set }: StepProps) {
  // Called straight from the press handler: web browsers only open the file chooser from inside a tap.
  const add = () => {
    void pickSamplePhoto().then((uri) => {
      if (uri) set({ photos: [...form.photos, uri].slice(0, MAX_PHOTOS) });
    });
  };
  return (
    <View className="gap-3">
      <Text className="text-primary-hover">Add up to {MAX_PHOTOS} photos of your pieces. Photos are optional.</Text>
      <View className="flex-row flex-wrap gap-3">
        {form.photos.map((uri, i) => (
          <View key={uri} className="relative">
            <Image source={{ uri }} accessibilityLabel={`Sample photo ${i + 1}`} contentFit="cover" className="h-28 w-24 rounded-xl bg-card" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove sample photo ${i + 1}`}
              onPress={() => set({ photos: form.photos.filter((p) => p !== uri) })}
              hitSlop={8}
              className="absolute -right-2 -top-2 h-11 w-11 items-center justify-center">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-ink/80">
                <Text className="text-xs text-inverse" accessible={false}>
                  ✕
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
        {form.photos.length < MAX_PHOTOS ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a sample photo"
            onPress={add}
            className="h-28 w-24 items-center justify-center gap-1 rounded-xl border border-dashed border-muted hover:bg-card">
            <Icon name="plusDark" size={20} />
            <Text className="text-xs">Add photo</Text>
          </Pressable>
        ) : null}
      </View>
      {errors.photos ? (
        <Text accessibilityRole="alert" className="text-xs text-danger">
          {errors.photos}
        </Text>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row gap-3">
      <Text className="w-28 text-primary-hover">{label}</Text>
      <Text weight="medium" className="flex-1">
        {value}
      </Text>
    </View>
  );
}

export function ReviewStep({ form, set, error }: { form: ApplicationForm; set: StepProps['set']; error?: string }) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text>Anything else we should know? (optional)</Text>
        <TextInput
          accessibilityLabel="Note to the Rack team"
          value={form.note}
          onChangeText={(note) => set({ note })}
          multiline
          maxLength={1000}
          textAlignVertical="top"
          placeholderTextColor={colors.muted}
          className="h-28 rounded-md border border-line bg-surface p-4 font-sans text-sm text-ink"
        />
      </View>
      <View className="gap-2 rounded-xl bg-card p-4">
        <SummaryRow label="Business" value={form.businessName.trim()} />
        <SummaryRow label="Instagram" value={form.instagram.trim() || 'None'} />
        <SummaryRow label="Phone" value={form.phone.trim()} />
        <SummaryRow label="City" value={form.city.trim()} />
        <SummaryRow label="Categories" value={form.categories.map(categoryLabel).join(', ')} />
        <SummaryRow label="Photos" value={`${form.photos.length} added`} />
      </View>
      {error ? (
        <Text accessibilityRole="alert" className="text-xs text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function StepButtons({
  step,
  onBack,
  onNext,
  submitting,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}) {
  const last = step === STEP_TITLES.length - 1;
  return (
    <View className="gap-3 pt-2">
      <Button label={last ? 'Submit application' : 'Continue'} arrow loading={submitting} onPress={onNext} />
      {step > 0 ? <Button variant="secondary" label="Back" disabled={submitting} onPress={onBack} /> : null}
    </View>
  );
}
