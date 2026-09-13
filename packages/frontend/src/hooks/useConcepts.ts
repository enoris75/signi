import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchConcepts } from '../api.ts';
import type { GrammaticalRole } from '@signi/shared';

// The concepts of one role, or the whole catalog. Shared by the hook and by code that has to wait
// for the list outside a render (`queryClient.ensureQueryData(conceptsQuery())`).
export const conceptsQuery = (role?: GrammaticalRole) =>
  queryOptions({
    queryKey: ['concepts', role ?? 'all'],
    queryFn: () => fetchConcepts(role),
    staleTime: Infinity,
  });

export function useConcepts(role?: GrammaticalRole) {
  return useQuery(conceptsQuery(role));
}
