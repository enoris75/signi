import { useQuery } from '@tanstack/react-query';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { fetchLanguages } from '../api.ts';
import type { LanguageOption } from '../api.ts';
import { useUiLanguage } from './LanguageContext.tsx';

// Uppercase the first character only (leaving multi-word labels alone). The engine renders
// language names lower-case outside English; a capitalised initial reads better as a label
// and is a no-op for non-cased scripts (e.g. Japanese 日本語).
function capitalizeFirst(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Returns a function giving each language's name rendered by the engine (via /api/languages)
// in the current UI language — capitalised, trailing full stop stripped — with the static
// English name as a fallback while the data loads. Shared by the header selector and the
// translations panel so their labels stay in lock-step.
export function useLanguageName(): (code: LanguageCode) => string {
  const { uiLanguage } = useUiLanguage();
  const { data } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
    staleTime: Infinity,
  });

  const byCode = new Map<LanguageCode, LanguageOption>(data?.map((o) => [o.code, o]));

  return (code) => {
    const text = byCode.get(code)?.translations.find((t) => t.language === uiLanguage)?.text;
    return text ? capitalizeFirst(text.replace(/[.。]\s*$/, '')) : LANGUAGES[code];
  };
}
