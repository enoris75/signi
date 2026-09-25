import { translate } from '@signi/engine';
import { READY_LANGUAGES, isPreviewLanguage } from '@signi/shared';
import type { LanguageCode } from '@signi/shared';
import { concepts } from './concepts/index.js';
import { notingLookup } from './lexicon.js';

// A definition renders as a fragment (a bare noun phrase), so the trailing full stop the engine
// puts on a period is dropped — ASCII "." or Japanese "。" — the same trim usePayoff applies.
function stripPeriod(text: string): string {
  return text.replace(/[.。]\s*$/, '');
}

/**
 * Renders every concept that carries a `definition` plan into all seven languages, exactly as the
 * UI-string catalog is rendered (see uiStrings.ts) — the engine composes the definition from
 * seeded concepts so it is localized the same way the rest of the app is. Built once at startup
 * and served from memory; a plan that names an unseeded concept, or fails to render in some
 * language, throws here, at boot, with the concept and the unknown ids or missing languages named,
 * rather than serving a tooltip with a hole in it.
 *
 * Returns a map from concept id to its per-language definition; concepts without a plan are
 * absent and fall back to their stored `concept_definitions` literal at read time.
 */
export function buildConceptDefinitions(): Map<string, Partial<Record<LanguageCode, string>>> {
  const out = new Map<string, Partial<Record<LanguageCode, string>>>();
  const previewHoles = new Map<LanguageCode, number>();

  for (const c of concepts) {
    if (!c.definition) continue;

    const { lookup, unknown } = notingLookup();
    const rendered = translate(c.definition, lookup);
    // The engine renders an unseeded concept as an empty word, so a plan naming one still renders
    // in every language, with a hole in it: refuse it the way /api/translate does (A253).
    if (unknown.size > 0) {
      const ids = [...unknown];
      throw new Error(
        `Definition for "${c.id}" names unknown concept${ids.length > 1 ? 's' : ''}: ${ids.join(', ')}. ` +
          'Seed them, or change the plan.',
      );
    }
    const byLanguage: Partial<Record<LanguageCode, string>> = {};
    for (const t of rendered) {
      if (t.text) byLanguage[t.language] = stripPeriod(t.text);
    }

    const missing = READY_LANGUAGES.filter((code) => !byLanguage[code]);
    if (missing.length > 0) {
      throw new Error(
        `Definition for "${c.id}" did not render in: ${missing.join(', ')}. ` +
          'Check the concepts its plan references are seeded in every language.',
      );
    }

    // A preview language (P10-E1) may leave a definition unrendered: counted, not thrown, and the
    // picker falls back to the English literal for it.
    for (const t of rendered) {
      if (!t.text && isPreviewLanguage(t.language)) previewHoles.set(t.language, (previewHoles.get(t.language) ?? 0) + 1);
    }

    out.set(c.id, byLanguage);
  }

  for (const [language, count] of previewHoles) {
    console.warn(`[definitions] preview language "${language}": ${count} engine-composed definitions do not render yet.`);
  }
  return out;
}
