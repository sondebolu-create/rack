import { QueryClient } from '@tanstack/react-query';

/**
 * One cache for the app. Catalogue data is fresh for 30 seconds (so flipping between screens doesn't refetch),
 * and a failed request is retried once before the screen shows its error state with a Retry button.
 */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true } },
});
