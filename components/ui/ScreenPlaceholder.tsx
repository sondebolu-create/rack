import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { Screen } from './Screen';
import { Text } from './Text';

export type ScreenPlaceholderProps = {
  name: string;
  /** Requirement ID from the spec, e.g. "M2". */
  req?: string;
  back?: boolean;
  children?: ReactNode;
};

/** Stand-in body for routes that have no feature yet. */
export function ScreenPlaceholder({ name, req, back, children }: ScreenPlaceholderProps) {
  return (
    <Screen back={back} accessibilityLabel={name}>
      <View className="flex-1 gap-4 pt-4">
        <Text weight="bold" className="text-2xl" accessibilityRole="header">
          {name}
        </Text>
        <Card>
          <Text className="text-muted">{req ? `Placeholder for ${req}.` : 'Placeholder.'}</Text>
        </Card>
        {children}
      </View>
    </Screen>
  );
}
