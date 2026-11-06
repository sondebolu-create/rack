import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

export type KeyboardAvoidProps = {
  children: ReactNode;
  /** Pass false when a ScrollView inside already adjusts itself (automaticallyAdjustKeyboardInsets). */
  native?: boolean;
  className?: string;
};

/** Lifts its content above the on-screen keyboard. The web version is KeyboardAvoid.web.tsx. */
export function KeyboardAvoid({ children, native = true, className = 'flex-1' }: KeyboardAvoidProps) {
  return (
    <KeyboardAvoidingView
      enabled={native}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className={className}>
      {children}
    </KeyboardAvoidingView>
  );
}
