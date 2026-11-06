import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

const SUFFIX = 'Rack';

/**
 * Sets the browser tab title while this screen is focused ("Home · Rack"). No-op on native.
 * Pass nothing for the bare brand title. Pass undefined-safe strings for data that may still be loading.
 */
export function usePageTitle(title?: string) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web' || typeof document === 'undefined') return;
      document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
    }, [title])
  );
}
