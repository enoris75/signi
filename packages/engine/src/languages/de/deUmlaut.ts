import { DE_UMLAUT } from './de.consts.js';

/**
 * Umlaut the stem vowel (a→ä, o→ö, u→ü, au→äu). Most monosyllabic adjectives mutate under
 * comparison (alt → älter, groß → größer), but many do not (klar → klarer, not *klärer) — the
 * distinction is lexical, so this is applied only when the lexeme carries the seeded `umlaut`
 * flag, never as a blanket rule. Mutates the last stem vowel (the one before the final consonant
 * run), which is the comparison-relevant one in the monosyllables that umlaut.
 */
export function deUmlaut(base: string): string {
  return base.replace(/(au|[aou])(?=[^aeiouäöü]*$)/, (v) => DE_UMLAUT[v] ?? v);
}
