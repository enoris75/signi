import { translate } from '@signi/engine';
import { UI_STRINGS, LANGUAGES } from '@signi/shared';
import type { LanguageCode, UiStringFormat, UiStringKey, UiStrings } from '@signi/shared';
import { lookupLexicalEntry } from './lexicon.js';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

function applyFormat(text: string, format?: UiStringFormat): string {
  let out = text;
  // ASCII "." or Japanese "。".
  if (format?.stripPeriod) out = out.replace(/[.。]\s*$/, '');
  if (format?.capitalize && out) out = out[0].toUpperCase() + out.slice(1);
  return out;
}

/**
 * Renders every entry of the UI-string catalog into every language. The result depends only
 * on the lexicon, so index.ts builds it once at startup and serves it from memory — which
 * also means a plan referencing an unseeded concept crashes the server on boot rather than
 * silently serving a broken string.
 */
export function buildUiStrings(): UiStrings {
  const out = {} as UiStrings;

  for (const key of Object.keys(UI_STRINGS) as UiStringKey[]) {
    const def = UI_STRINGS[key];
    const byLanguage = {} as Record<LanguageCode, string>;

    for (const t of translate(def.plan, lookupLexicalEntry)) {
      byLanguage[t.language] = applyFormat(t.text, def.format);
    }

    const missing = LANGUAGE_CODES.filter((code) => !byLanguage[code]);
    if (missing.length > 0) {
      throw new Error(
        `UI string "${key}" did not render in: ${missing.join(', ')}. ` +
          'Check the concepts its plan references are seeded in every language.',
      );
    }

    out[key] = byLanguage;
  }

  return out;
}
