import { hashKey, useQueries } from '@tanstack/react-query';
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
// Periods that say the same thing (two empty ones, say) share one query: the same key twice in
// one `useQueries` is a duplicate it warns about.
export function useTranslations(plans: Partial<PhrasePlan>[]): SentenceResult[] {
  const keys = plans.map((plan) => hashKey(['translation', plan]));
  const unique = [...new Map(plans.map((plan, i) => [keys[i]!, plan])).entries()];
  const slot = new Map(unique.map(([key], i) => [key, i]));
  return useQueries({
    queries: unique.map(([, plan]) => ({
      queryKey: ['translation', plan],
      queryFn: () => fetchTranslation(plan as PhrasePlan),
      enabled: hasSubject(plan),
      staleTime: 1000 * 60,
    })),
    combine: (results) =>
      plans.map((plan, i) => {
        const r = results[slot.get(keys[i]!)!]!;
        return {
          translations: r.data,
          isLoading: r.isLoading,
          isError: r.isError,
          isReady: hasSubject(plan),
        };
      }),
  });
}
