import { useQueries } from '@tanstack/react-query';
import { fetchTranslation } from '../api.ts';
import { nounConjuncts, type PhrasePlan, type Translation } from '@signi/shared';

// One root sentence's translation request state.
export interface SentenceResult {
  translations?: Translation[];
  isLoading: boolean;
  isError: boolean;
  // A subject alone is enough to translate — a verbless period is a bare noun phrase.
  isReady: boolean;
}

// A period is translatable once its subject slot has a head — which, for a coordinated subject,
// is its first conjunct ("Peter and Paul": Peter is enough to translate).
function hasSubject(plan: Partial<PhrasePlan>): boolean {
  return Boolean(plan.subject && nounConjuncts(plan.subject)[0]?.concept);
}

// Translate every root sentence of the workspace in one hook. `useQueries` takes a
// dynamic list, so periods can be added and removed without breaking the rules of hooks.
export function useTranslations(plans: Partial<PhrasePlan>[]): SentenceResult[] {
  return useQueries({
    queries: plans.map((plan) => ({
      queryKey: ['translation', plan],
      queryFn: () => fetchTranslation(plan as PhrasePlan),
      enabled: hasSubject(plan),
      staleTime: 1000 * 60,
    })),
    combine: (results) =>
      results.map((r, i) => ({
        translations: r.data,
        isLoading: r.isLoading,
        isError: r.isError,
        isReady: hasSubject(plans[i]),
      })),
  });
}
