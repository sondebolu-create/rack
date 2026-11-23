import { QueryClient } from '@tanstack/react-query';

/**
 * One cache for the app. Catalogue data is fresh for 30 seconds (so flipping between screens doesn't refetch).
 *
 * No retry here: supabase-js already retries a failed request a few times with backoff (about 7 seconds in all), so
 * retrying again on top made the error state take about 15 seconds to appear. After that the screen shows Retry.
 *
 * `networkMode: 'always'`: by default React Query pauses a request while the device looks offline, which leaves a
 * skeleton on screen forever. On flaky mobile data we would rather try, fail fast and show Retry.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: true, networkMode: 'always' },
    mutations: { networkMode: 'always' },
  },
});
