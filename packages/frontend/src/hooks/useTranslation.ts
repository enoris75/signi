import { useQuery } from '@tanstack/react-query';
import { fetchTranslation } from '../api.ts';
import type { PhrasePlan } from '@signi/shared';

export function useTranslation(plan: Partial<PhrasePlan>) {
  const enabled = Boolean(plan.subject?.concept && plan.verbPhrase?.verb);
  return useQuery({
    queryKey: ['translation', plan],
    queryFn: () => fetchTranslation(plan as PhrasePlan),
    enabled,
    staleTime: 1000 * 60,
  });
}
