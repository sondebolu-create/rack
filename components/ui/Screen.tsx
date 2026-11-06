import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePageTitle } from '@/lib/usePageTitle';
import { BackLink } from './BackHeader';

export type ScreenProps = {
  children?: ReactNode;
  /** Shows a "Back" header with an arrow. */
  back?: boolean;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Names the screen for assistive tech and, on web, for the browser tab title. */
  accessibilityLabel?: string;
  /** Browser tab title when it should differ from `accessibilityLabel`. */
  pageTitle?: string;
  className?: string;
};

export function Screen({
  children,
  back = false,
  scroll = false,
  accessibilityLabel,
  pageTitle,
  className = '',
}: ScreenProps) {
  usePageTitle(pageTitle ?? accessibilityLabel);
  const body = scroll ? (
    <ScrollView className="flex-1" contentContainerClassName={`pb-8 ${className}`}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`}>{children}</View>
  );

  return (
    // The side padding lives on an inner View: on web, SafeAreaView writes its own inline padding
    // from env(safe-area-inset-*), which would override a px-4 on the same element.
    <SafeAreaView
      accessibilityLabel={accessibilityLabel}
      edges={['top', 'left', 'right']}
      className="flex-1 bg-surface">
      <View className="flex-1 px-4">
        {back ? <BackLink /> : null}
        {body}
      </View>
    </SafeAreaView>
  );
}
