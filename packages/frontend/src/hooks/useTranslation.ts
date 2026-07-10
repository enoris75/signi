import { useQueries } from '@tanstack/react-query';
import { fetchTranslation } from '../api.ts';
import type { PhrasePlan, Translation } from '@signi/shared';

// One root sentence's translation request state.
export interface SentenceResult {
  translations?: Translation[];
  isLoading: boolean;
  isError: boolean;
  // A subject alone is enough to translate — a verbless period is a bare noun phrase.
  isReady: boolean;
}

// Translate every root sentence of the workspace in one hook. `useQueries` takes a
// dynamic list, so periods can be added and removed without breaking the rules of hooks.
export function useTranslations(plans: Partial<PhrasePlan>[]): SentenceResult[] {
  return useQueries({
    queries: plans.map((plan) => ({
      queryKey: ['translation', plan],
      queryFn: () => fetchTranslation(plan as PhrasePlan),
      enabled: Boolean(plan.subject?.concept),
      staleTime: 1000 * 60,
    })),
    combine: (results) =>
      results.map((r, i) => ({
        translations: r.data,
        isLoading: r.isLoading,
        isError: r.isError,
        isReady: Boolean(plans[i].subject?.concept),
      })),
  });
}
