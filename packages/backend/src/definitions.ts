import { translate } from '@signi/engine';
import { LANGUAGES } from '@signi/shared';
import type { LanguageCode } from '@signi/shared';
import { concepts } from './concepts/index.js';
import { lookupLexicalEntry } from './lexicon.js';

const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

// A definition renders as a fragment (a bare noun phrase), so the trailing full stop the engine
// puts on a period is dropped — ASCII "." or Japanese "。" — the same trim usePayoff applies.
function stripPeriod(text: string): string {
  return text.replace(/[.。]\s*$/, '');
}

/**
 * Renders every concept that carries a `definition` plan into all seven languages, exactly as the
 * UI-string catalog is rendered (see uiStrings.ts) — the engine composes the definition from
 * seeded concepts so it is localized the same way the rest of the app is. Built once at startup
 * and served from memory; a plan that fails to render in some language throws here, at boot, with
 * the concept and the missing languages named, rather than serving a half-translated tooltip.
 *
 * Returns a map from concept id to its per-language definition; concepts without a plan are
 * absent and fall back to their stored `concept_definitions` literal at read time.
 */
export function buildConceptDefinitions(): Map<string, Partial<Record<LanguageCode, string>>> {
  const out = new Map<string, Partial<Record<LanguageCode, string>>>();

  for (const c of concepts) {
    if (!c.definition) continue;

    const rendered = translate(c.definition, lookupLexicalEntry);
    const byLanguage: Partial<Record<LanguageCode, string>> = {};
    for (const t of rendered) {
      if (t.text) byLanguage[t.language] = stripPeriod(t.text);
    }

    const missing = LANGUAGE_CODES.filter((code) => !byLanguage[code]);
    if (missing.length > 0) {
      throw new Error(
        `Definition for "${c.id}" did not render in: ${missing.join(', ')}. ` +
          'Check the concepts its plan references are seeded in every language.',
      );
    }

    out.set(c.id, byLanguage);
  }

  return out;
}
