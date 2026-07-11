import { useQuery } from '@tanstack/react-query';
import { UI_STRINGS } from '@signi/shared';
import type { UiStringKey } from '@signi/shared';
import { fetchUiStrings } from '../api.ts';
import { useUiLanguage } from './LanguageContext.tsx';

/**
 * Returns `t`, giving any UI string of the catalog (@signi/shared uiStrings.ts) as the engine
 * renders it in the current UI language — the same translation path as the phrases the app
 * builds. While the bundle loads (or if the backend is unreachable) `t` returns the entry's
 * static English fallback, so nothing ever renders blank.
 *
 * The whole catalog arrives in one request and is cached forever: switching language is a
 * re-render, not a re-fetch.
 */
export function useUiString(): (key: UiStringKey) => string {
  const { uiLanguage } = useUiLanguage();
  const { data } = useQuery({
    queryKey: ['ui-strings'],
    queryFn: fetchUiStrings,
    staleTime: Infinity,
  });

  return (key) => data?.[key]?.[uiLanguage] ?? UI_STRINGS[key].fallback;
}
