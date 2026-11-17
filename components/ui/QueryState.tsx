import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';

export type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  /** Shown while loading. */
  skeleton: ReactNode;
  /** Shown when the request worked and there is nothing to show. */
  emptyText: string;
  errorText?: string;
  children: ReactNode;
};

/** Every list's four states: loading skeleton, error with Retry, empty message, or the content. */
export function QueryState({ isLoading, isError, onRetry, isEmpty, skeleton, emptyText, errorText = 'Could not load this. Check your connection.', children }: QueryStateProps) {
  if (isLoading) return <View accessibilityLabel="Loading" accessibilityLiveRegion="polite">{skeleton}</View>;
  if (isError) {
    return (
      <View className="items-start gap-3">
        <Text accessibilityRole="alert" className="text-danger">
          {errorText}
        </Text>
        <Button variant="secondary" fullWidth={false} label="Retry" onPress={onRetry} />
      </View>
    );
  }
  if (isEmpty) return <Text className="text-primary-hover">{emptyText}</Text>;
  return <>{children}</>;
}
