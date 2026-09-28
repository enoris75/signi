import type { ReactElement } from 'react';
import type { LanguageCode } from '@signi/shared';

/**
 * A row's emblem: an emoji flag, or an inline SVG where no emoji says which variety the row is
 * (P10-E2, after P03 D3). A regional variety is labelled by its region, not its country, so Swiss
 * German — one dialect, Zürich's (P10 D1) — carries the arms of Zürich rather than 🇨🇭.
 */
export type FlagDef = string | { svg: ArmsId };

/**
 * The inline arms (P10-E2, P04-E2): Zürich for Swiss German, and the Three Leagues for the three
 * Romansh varieties (P04 D3) — the cantonal arms of Graubünden for the supraregional Rumantsch
 * Grischun, the Grey League (the Surselva) for Sursilvan, the League of God's House (the Engadine)
 * for Vallader.
 */
export type ArmsId = 'zurich' | 'graubuenden' | 'grey-league' | 'gods-house' | 'senyera';

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
  'rm-rumgr': { svg: 'graubuenden' },
  'rm-sursilv': { svg: 'grey-league' },
  'rm-vallader': { svg: 'gods-house' },
  // Catalan has no flag emoji of its own (the tag sequence draws a plain black flag), so the Senyera
  // is drawn inline (P03 D3).
  ca: { svg: 'senyera' },
  pl: '🇵🇱',
  lt: '🇱🇹',
};

const SVG_STYLE = { display: 'inline-block', verticalAlign: '-0.125em' } as const;

/**
 * The hairline that keeps a white field visible on a white background, and a sable one on a dark
 * background: a mid grey, so it shows in both themes (P04-E18).
 */
function Hairline() {
  return <rect x="0.25" y="0.25" width="15.5" height="15.5" fill="none" stroke="rgba(128,128,128,0.8)" strokeWidth="0.5" />;
}

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
      <Hairline />
    </svg>
  );
}

/**
 * An ibex rampant sable, facing dexter, drawn for 16px rather than traced (P04 §6): a body, raised
 * forelegs, hind legs, and the one great horn swept back — the silhouette, not the detail.
 */
function Ibex() {
  return (
    <g fill="#000000" stroke="#000000" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.6 3.8 C5.8 1.2 9.6 0.6 10.6 3.6" fill="none" strokeWidth="1.2" />
      <ellipse cx="4.8" cy="4.7" rx="1.5" ry="1" transform="rotate(30 4.8 4.7)" stroke="none" />
      <path d="M4.2 5.4 L4 6.4" fill="none" strokeWidth="0.6" />
      <path d="M5.4 4.4 L7.6 5.2 L10.6 9 L10.8 12.2 L8.2 12.2 L6 7.8 Z" strokeWidth="0.6" />
      <path d="M6.6 6.6 L4.2 6.8 L3.4 8.2 M7.2 8.6 L4.8 9.4 L4.4 10.8" fill="none" strokeWidth="1" />
      <path d="M8.6 12 L7.8 15 M10.2 12 L11.2 15" fill="none" strokeWidth="1.1" />
      <path d="M10.6 9.2 L11.8 8.4" fill="none" strokeWidth="0.8" />
    </g>
  );
}

/** The Grey League, *per pale sable and argent*: black on the left, white on the right (Sursilvan). */
function GreyLeagueArms() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" data-testid="flag-grey-league" style={SVG_STYLE}>
      <rect x="0" y="0" width="8" height="16" fill="#000000" />
      <rect x="8" y="0" width="8" height="16" fill="#ffffff" />
      <Hairline />
    </svg>
  );
}

/** The League of God's House, *argent, an ibex rampant sable* (Vallader). */
function GodsHouseArms() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" data-testid="flag-gods-house" style={SVG_STYLE}>
      <rect x="0" y="0" width="16" height="16" fill="#ffffff" />
      <Ibex />
      <Hairline />
    </svg>
  );
}

/**
 * The cantonal arms of Graubünden (1932), *divided, the chief split*: the Grey League top left, the
 * Ten Jurisdictions top right (*quarterly azure and or, a cross counterchanged*), the League of
 * God's House across the base (Rumantsch Grischun, the supraregional standard).
 */
function GraubuendenArms() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" data-testid="flag-graubuenden" style={SVG_STYLE}>
      <rect x="0" y="0" width="4" height="8" fill="#000000" />
      <rect x="4" y="0" width="4" height="8" fill="#ffffff" />
      <rect x="8" y="0" width="4" height="4" fill="#1f4fa3" />
      <rect x="12" y="0" width="4" height="4" fill="#f2c200" />
      <rect x="8" y="4" width="4" height="4" fill="#f2c200" />
      <rect x="12" y="4" width="4" height="4" fill="#1f4fa3" />
      {/* The cross counterchanged: each arm's piece takes the tincture of the quarter it is not in. */}
      <rect x="11.4" y="0.6" width="0.6" height="3.4" fill="#f2c200" />
      <rect x="8.6" y="3.4" width="3.4" height="0.6" fill="#f2c200" />
      <rect x="12" y="0.6" width="0.6" height="3.4" fill="#1f4fa3" />
      <rect x="12" y="3.4" width="3.4" height="0.6" fill="#1f4fa3" />
      <rect x="11.4" y="4" width="0.6" height="3.4" fill="#1f4fa3" />
      <rect x="8.6" y="4" width="3.4" height="0.6" fill="#1f4fa3" />
      <rect x="12" y="4" width="0.6" height="3.4" fill="#f2c200" />
      <rect x="12" y="4" width="3.4" height="0.6" fill="#f2c200" />
      <rect x="0" y="8" width="16" height="8" fill="#ffffff" />
      <g transform="translate(4.4 8) scale(0.5)">
        <Ibex />
      </g>
      <Hairline />
    </svg>
  );
}

/**
 * The Senyera, *or, four pallets gules* laid flat as a flag: nine equal horizontal stripes, gold
 * and red, gold at the top and the bottom (P03 D3).
 */
function Senyera() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" data-testid="flag-senyera" style={SVG_STYLE}>
      <rect x="0" y="0" width="16" height="16" fill="#fcdd09" />
      {[1, 3, 5, 7].map((i) => (
        <rect key={i} x="0" y={(i * 16) / 9} width="16" height={16 / 9} fill="#da121a" />
      ))}
    </svg>
  );
}

const ARMS: Record<ArmsId, () => ReactElement> = {
  zurich: ZurichArms,
  graubuenden: GraubuendenArms,
  'grey-league': GreyLeagueArms,
  'gods-house': GodsHouseArms,
  senyera: Senyera,
};

/**
 * The emblem for one language. Decorative: the row's label names the language (and, for Swiss
 * German, the dialect), so the SVG is hidden from assistive technology as an emoji flag is not read
 * as anything more than its label either.
 */
export function Flag({ language }: { language: LanguageCode }) {
  const flag = FLAG[language];
  if (typeof flag === 'string') return <>{flag}</>;
  const Arms = ARMS[flag.svg];
  return <Arms />;
}
