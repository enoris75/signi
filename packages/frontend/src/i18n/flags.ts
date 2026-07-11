import type { LanguageCode } from '@signi/shared';

// Emoji flag per UI/translation language. Shared by the header language selector and the
// translations panel so the two stay in lock-step.
export const FLAG: Record<LanguageCode, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  ja: '🇯🇵',
  pt: '🇵🇹',
};
