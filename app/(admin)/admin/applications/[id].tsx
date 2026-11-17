import { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VendorShell } from '@/components/auth/VendorShell';
import { InstagramLink, PhotoStrip, StatusBadge } from '@/components/admin/ApplicationViews';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useAuthStore } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import {
  approveApplication,
  categoryLabel,
  getApplication,
  rejectApplication,
  signedPhotoMap,
  type ApplicationRow,
} from '@/lib/vendorApplication';
import { colors } from '@/theme';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-0.5">
      <Text className="text-primary-hover">{label}</Text>
      {children}
    </View>
  );
}

/** Application detail with Approve (approve_vendor) and Reject (a review note is required). */
export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const adminId = useAuthStore((s) => s.session?.user.id);
  const [app, setApp] = useState<ApplicationRow | null | undefined>(undefined);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const load = async () => {
    const { data } = await getApplication(id);
    setApp(data);
    if (data) setUrls(await signedPhotoMap(data.sample_photo_urls));
  };
  useEffect(() => {
    let live = true;
    void getApplication(id).then(async ({ data }) => {
      if (!live) return;
      setApp(data);
      if (data) setUrls(await signedPhotoMap(data.sample_photo_urls));
    });
    return () => {
      live = false;
    };
  }, [id]);

  const approve = async () => {
    setBusy('approve');
    setError(undefined);
    const { error: err } = await approveApplication(id);
    if (err) setError(err);
    await load();
    setBusy(null);
  };

  const reject = async () => {
    if (!note.trim()) return setNoteError('Write a note for the applicant. They will see it.');
    if (!adminId) return;
    setNoteError(undefined);
    setBusy('reject');
    setError(undefined);
    const { error: err } = await rejectApplication(id, adminId, note);
    if (err) setError(err);
    await load();
    setBusy(null);
  };

  const links = [{ label: 'Applications', href: '/admin/applications' as const }];

  if (app === undefined) {
    return (
      <VendorShell title="Application" links={links}>
        <ActivityIndicator accessibilityLabel="Loading" color={colors.ink} className="self-start" />
      </VendorShell>
    );
  }
  if (app === null) {
    return (
      <VendorShell title="Application" links={links}>
        <Text>Application not found.</Text>
        <Button variant="secondary" fullWidth={false} label="Back to applications" onPress={() => router.replace('/admin/applications')} />
      </VendorShell>
    );
  }

  return (
    <VendorShell title={app.business_name} links={links}>
      <View className="w-full max-w-[720px] gap-6">
        <Button variant="secondary" fullWidth={false} label="Back to applications" onPress={() => router.replace('/admin/applications')} />
        <StatusBadge status={app.status} />

        <Card className="gap-4">
          <Field label="Instagram">
            <InstagramLink handle={app.instagram_handle} />
          </Field>
          <Field label="Phone">
            <Text weight="medium">{app.phone}</Text>
          </Field>
          <Field label="City">
            <Text weight="medium">{app.city}</Text>
          </Field>
          <Field label="Categories">
            <Text weight="medium">{app.categories.map(categoryLabel).join(', ') || 'None'}</Text>
          </Field>
          <Field label="Submitted">
            <Text weight="medium">{formatDate(new Date(app.created_at).getTime())}</Text>
          </Field>
          {app.note ? (
            <Field label="Note from the applicant">
              <Text>{app.note}</Text>
            </Field>
          ) : null}
          {app.review_note ? (
            <Field label="Review note">
              <Text>{app.review_note}</Text>
            </Field>
          ) : null}
        </Card>

        <View className="gap-2">
          <Text weight="medium">Sample photos</Text>
          <PhotoStrip paths={app.sample_photo_urls} urls={urls} size="lg" />
        </View>

        {error ? (
          <Text accessibilityRole="alert" className="text-danger">
            {error}
          </Text>
        ) : null}

        {app.status === 'pending' ? (
          <View className="gap-4">
            <Button label="Approve" arrow loading={busy === 'approve'} disabled={busy !== null} onPress={approve} />
            <View className="gap-2">
              <Text>Review note (required to reject, shown to the applicant)</Text>
              <TextInput
                accessibilityLabel="Review note"
                value={note}
                onChangeText={(t) => {
                  setNote(t);
                  setNoteError(undefined);
                }}
                multiline
                maxLength={1000}
                textAlignVertical="top"
                placeholderTextColor={colors.muted}
                className={`h-28 rounded-md border bg-surface p-4 font-sans text-sm text-ink ${noteError ? 'border-danger' : 'border-line'}`}
              />
              {noteError ? (
                <Text accessibilityRole="alert" className="text-xs text-danger">
                  {noteError}
                </Text>
              ) : null}
              <Button variant="secondary" label="Reject" loading={busy === 'reject'} disabled={busy !== null} onPress={reject} />
            </View>
          </View>
        ) : (
          <Text className="text-primary-hover">This application has been {app.status}.</Text>
        )}
      </View>
    </VendorShell>
  );
}
