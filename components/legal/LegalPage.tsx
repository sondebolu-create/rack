import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

/** Banner shown on every legal page until real text replaces the placeholder. Delete it when you do. */
function PlaceholderBanner() {
  return (
    <View accessibilityRole="alert" className="gap-1 rounded-lg border border-ink bg-card p-3">
      <Text weight="bold">PLACEHOLDER TEXT, REPLACE BEFORE LAUNCH</Text>
      <Text>
        This page is a draft outline, not legal advice. Anything in [SQUARE BRACKETS] is a blank to fill in. Have a
        Nigerian lawyer review the final text.
      </Text>
    </View>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Screen back scroll accessibilityLabel={title}>
      <View className="gap-4 pt-2">
        <Text weight="medium" accessibilityRole="header" className="text-xl">
          {title}
        </Text>
        <Text className="text-primary-hover">Last updated: {updated}</Text>
        <PlaceholderBanner />
        {children}
      </View>
    </Screen>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text weight="medium" accessibilityRole="header" className="text-base">
        {heading}
      </Text>
      {children}
    </View>
  );
}

export const P = ({ children }: { children: ReactNode }) => <Text>{children}</Text>;
export const Li = ({ children }: { children: ReactNode }) => <Text className="pl-3">• {children}</Text>;
