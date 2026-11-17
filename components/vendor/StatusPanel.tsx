import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { formatDate } from '@/lib/format';
import type { ApplicationRow } from '@/lib/vendorApplication';

export type StatusPanelProps = {
  application: ApplicationRow;
  /** True once the profile role is vendor, i.e. the dashboard will let them in. */
  isVendor: boolean;
  onRefresh: () => Promise<void>;
  onApplyAgain: () => void;
  onOpenDashboard: () => void;
};

export function StatusPanel({ application, isVendor, onRefresh, onApplyAgain, onOpenDashboard }: StatusPanelProps) {
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    setBusy(true);
    await onRefresh();
    setBusy(false);
  };
  const submitted = `Submitted ${formatDate(new Date(application.created_at).getTime())} for ${application.business_name}.`;

  return (
    <View className="w-full max-w-[480px] gap-4">
      {application.status === 'pending' ? (
        <>
          <Card className="gap-2">
            <Text weight="medium" className="text-lg">
              Under review
            </Text>
            <Text className="text-primary-hover">{submitted}</Text>
            {/* TODO: confirm the real review turnaround before launch. */}
            <Text>
              The Rack team looks at every application by hand. We usually reply within 2 to 3 working days. When you are
              approved, your shop is set up and this page gives you a button into your dashboard.
            </Text>
          </Card>
          <Button variant="secondary" label="Check for an update" loading={busy} onPress={refresh} />
        </>
      ) : null}

      {application.status === 'rejected' ? (
        <>
          <Card className="gap-2">
            <Text weight="medium" className="text-lg">
              Not approved this time
            </Text>
            <Text className="text-primary-hover">{submitted}</Text>
            {application.review_note ? (
              <View className="gap-1">
                <Text weight="medium">Note from the Rack team</Text>
                <Text>{application.review_note}</Text>
              </View>
            ) : null}
          </Card>
          <Button label="Apply again" arrow onPress={onApplyAgain} />
        </>
      ) : null}

      {application.status === 'approved' ? (
        <>
          <Card className="gap-2">
            <Text weight="medium" className="text-lg">
              You are approved
            </Text>
            <Text className="text-primary-hover">{submitted}</Text>
            <Text>Your shop is set up as a draft. Open your dashboard to get started.</Text>
          </Card>
          {isVendor ? (
            <Button label="Go to vendor dashboard" arrow onPress={onOpenDashboard} />
          ) : (
            <Button variant="secondary" label="Refresh" loading={busy} onPress={refresh} />
          )}
        </>
      ) : null}
    </View>
  );
}
