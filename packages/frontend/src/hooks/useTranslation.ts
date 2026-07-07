import { useQuery } from '@tanstack/react-query';
import { fetchTranslation } from '../api.ts';
import type { PhrasePlan } from '@signi/shared';

export function useTranslation(plan: Partial<PhrasePlan>) {
  // Translate as soon as a subject exists; the verb phrase is optional (a verbless
  // period is a bare noun phrase, e.g. "breaking news").
  const enabled = Boolean(plan.subject?.concept);
  return useQuery({
    queryKey: ['translation', plan],
    queryFn: () => fetchTranslation(plan as PhrasePlan),
    enabled,
    staleTime: 1000 * 60,
  });
}
