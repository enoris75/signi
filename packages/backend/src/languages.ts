import type { LanguageCode } from '@signi/shared';

// Maps each UI language to the noun concept that names it (seeded in concepts/nouns.ts).
// Lets GET /api/languages render every language's name via the engine, so the header
// selector's labels come from the same translation path as everything else.
export const LANGUAGE_NAME_CONCEPTS: Record<LanguageCode, string> = {
  en: 'ENGLISH',
  it: 'ITALIAN',
  fr: 'FRENCH',
  de: 'GERMAN',
  es: 'SPANISH',
  ja: 'JAPANESE',
  pt: 'PORTUGUESE',
};
