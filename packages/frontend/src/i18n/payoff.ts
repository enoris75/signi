import { useQuery } from '@tanstack/react-query';
import type { LanguageCode } from '@signi/shared';
import { fetchPayoff } from '../api.ts';

// Shown while the engine translation is in flight or the backend is unreachable, so the
// header never renders blank. The CSS uppercases it.
const FALLBACK = 'Semantic phrase builder';

// The app's payoff/tagline, rendered by the engine (see backend payoff.ts for the period
// that defines it) and returned in the current UI language. The trailing full stop is
// stripped — a tagline takes no period — and a static string covers load/error.
export function usePayoff(uiLanguage: LanguageCode): string {
  const { data } = useQuery({
    queryKey: ['payoff'],
    queryFn: fetchPayoff,
    staleTime: Infinity,
  });

  const text = data?.find((t) => t.language === uiLanguage)?.text;
  // Strip a trailing full stop — ASCII "." or Japanese "。" — a tagline takes no period.
  return text ? text.replace(/[.。]\s*$/, '') : FALLBACK;
}
