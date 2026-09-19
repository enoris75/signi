import { translate, translateWord, translateDeterminer, translatePossessive } from '@signi/engine';
import { UI_STRINGS, LANGUAGES } from '@signi/shared';
import type { LanguageCode, UiStringDef, UiStringFormat, UiStringKey, UiStrings } from '@signi/shared';
import { lookupLexicalEntry } from './lexicon.js';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

function applyFormat(text: string, format?: UiStringFormat): string {
  let out = text;
  // ASCII "." or Japanese "。". A question's "?" is not a full stop, so it stays.
  if (format?.stripPeriod) out = out.replace(/[.。]\s*$/, '');
  // The first letter, past any mark that opens the string: Spanish opens a question on "¿".
  if (format?.capitalize) out = out.replace(/^(\P{L}*)(\p{L})/u, (_, lead: string, first: string) => lead + first.toUpperCase());
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
    // Annotated, not inferred: the catalog preserves each entry's literal type, and only the
    // declared union tells a `word` entry from a `plan` one.
    const def: UiStringDef = UI_STRINGS[key];
    const byLanguage = {} as Record<LanguageCode, string>;

    const rendered =
      def.determiner !== undefined
        ? translateDeterminer(def.determiner, lookupLexicalEntry, def.agreesWith)
        : def.possessive !== undefined
          ? translatePossessive(def.possessive, lookupLexicalEntry, def.agreesWith)
          : def.word !== undefined
            ? translateWord(def.word, lookupLexicalEntry, def.agreesWith)
            : translate(def.plan, lookupLexicalEntry);

    for (const t of rendered) {
      if (t.text) byLanguage[t.language] = applyFormat(t.text, def.format);
    }

    const missing = LANGUAGE_CODES.filter((code) => !byLanguage[code]);
    if (missing.length > 0) {
      throw new Error(
        `UI string "${key}" did not render in: ${missing.join(', ')}. ` +
          'Check the concepts it references are seeded in every language.',
      );
    }

    out[key] = byLanguage;
  }

  return out;
}
