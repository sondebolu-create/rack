import { useWindowDimensions } from 'react-native';

/** Matches Tailwind's `lg`. Class-based layouts use `lg:`; use this hook only when JS needs to know. */
export const DESKTOP_MIN_WIDTH = 1024;

export function useIsDesktop(): boolean {
  return useWindowDimensions().width >= DESKTOP_MIN_WIDTH;
}
