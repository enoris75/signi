import { useQuery } from '@tanstack/react-query';
import { fetchConcepts } from '../api.ts';
import type { GrammaticalRole } from '@signi/shared';

export function useConcepts(role?: GrammaticalRole) {
  return useQuery({
    queryKey: ['concepts', role ?? 'all'],
    queryFn: () => fetchConcepts(role),
    staleTime: Infinity,
  });
}
