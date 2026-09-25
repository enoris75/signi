import type { LanguageCode } from '@signi/shared';

/**
 * A row's emblem: an emoji flag, or an inline SVG where no emoji says which variety the row is
 * (P10-E2, after P03 D3). A regional variety is labelled by its region, not its country, so Swiss
 * German — one dialect, Zürich's (P10 D1) — carries the arms of Zürich rather than 🇨🇭.
 */
export type FlagDef = string | { svg: 'zurich' };

// Shared by the header language selector and the translations panel so the two stay in lock-step.
export const FLAG: Record<LanguageCode, FlagDef> = {
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  ja: '🇯🇵',
  pt: '🇵🇹',
  gsw: { svg: 'zurich' },
};

/**
 * The arms of Zürich, *per bend argent and azure*: the bend runs from the top-left corner to the
 * bottom-right, silver (white) above it, blue below — the square cantonal flag. Two flat triangles,
 * so it stays legible at 16px; the hairline keeps the white half visible on a white background.
 */
function ZurichArms() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden="true"
      data-testid="flag-zurich"
      style={{ display: 'inline-block', verticalAlign: '-0.125em' }}
    >
      <polygon points="0,0 16,0 16,16" fill="#ffffff" />
      <polygon points="0,0 16,16 0,16" fill="#0f69c8" />
      <rect x="0.25" y="0.25" width="15.5" height="15.5" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.5" />
    </svg>
  );
}

/**
 * The emblem for one language. Decorative: the row's label names the language (and, for Swiss
 * German, the dialect), so the SVG is hidden from assistive technology as an emoji flag is not read
 * as anything more than its label either.
 */
export function Flag({ language }: { language: LanguageCode }) {
  const flag = FLAG[language];
  if (typeof flag === 'string') return <>{flag}</>;
  return <ZurichArms />;
}
