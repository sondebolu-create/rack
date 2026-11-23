import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { VendorShell } from '@/components/auth/VendorShell';
import {
  BusinessStep,
  CategoriesStep,
  PhotosStep,
  ReviewStep,
  StepButtons,
  StepProgress,
  STEP_TITLES,
} from '@/components/vendor/ApplicationSteps';
import { track } from '@/lib/analytics';
import { refreshProfile, useAuthStore } from '@/lib/auth';
import {
  EMPTY_FORM,
  submitApplication,
  validateStep,
  type ApplicationForm,
  type FormErrors,
} from '@/lib/vendorApplication';

/** V1 Vendor application. Steps keep one shared form object, so going back never loses input. */
export default function VendorApply() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user.id);
  const role = useAuthStore((s) => s.role);
  const application = useAuthStore((s) => s.application);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // Vendors have nothing to apply for; a pending application is shown on the status screen.
  // (A rejected one may apply again, so it stays here.)
  if (role === 'vendor') return <Redirect href="/vendor" />;
  if (application === 'pending' && !submitting) return <Redirect href="/vendor/application" />;

  const set = (patch: Partial<ApplicationForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
  };

  const next = async () => {
    const found = validateStep(step, form);
    setErrors(found);
    if (Object.keys(found).length) return;
    if (step < STEP_TITLES.length - 1) return setStep(step + 1);

    if (!userId) return;
    setSubmitting(true);
    setSubmitError(undefined);
    const { error } = await submitApplication(userId, form);
    if (error) {
      setSubmitting(false);
      return setSubmitError(error);
    }
    track('vendor_application_submitted', { categories: form.categories.length, photos: form.photos.length });
    await refreshProfile();
    router.replace('/vendor/application');
  };

  return (
    <VendorShell title="Apply to sell on Rack">
      <View className="w-full max-w-[480px] gap-6">
        <StepProgress step={step} />
        {step === 0 ? <BusinessStep form={form} errors={errors} set={set} /> : null}
        {step === 1 ? <CategoriesStep form={form} errors={errors} set={set} /> : null}
        {step === 2 ? <PhotosStep form={form} errors={errors} set={set} /> : null}
        {step === 3 ? <ReviewStep form={form} set={set} error={submitError} /> : null}
        <StepButtons step={step} submitting={submitting} onBack={() => setStep(step - 1)} onNext={next} />
      </View>
    </VendorShell>
  );
}
