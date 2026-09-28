import type { Case } from './pl.types.js';

/**
 * A noun in one case (P05 D3): read off the stored paradigm — `base` / `plural` for the nominative,
 * `{case}_sg` / `{case}_pl` for the others, `voc_sg` for the vocative (whose plural is the nominative).
 * A person or animal the plan made feminine (`gender: 'fem'` over a lexeme with a `fem` form, see
 * `applyNounGender`) reads the `fem_` paradigm (*kotka, kotki, …*). A cell the lexeme lacks falls
 * back on the nominative, so a noun no Polish column declines still says its word.
 */
export function nounForm(forms: Record<string, string>, kase: Case, plural: boolean): string {
  const fem = forms['gender'] === 'fem' && forms['fem'] !== undefined;
  const p = fem ? 'fem_' : '';
  const nominative = plural
    ? (forms[`${p}plural`] ?? forms['plural'] ?? forms['base'] ?? '')
    : ((fem ? forms['fem'] : forms['base']) ?? forms['base'] ?? '');
  if (kase === 'nom' || (kase === 'voc' && plural)) return nominative;
  const key = kase === 'voc' ? `${p}voc_sg` : `${p}${kase}_${plural ? 'pl' : 'sg'}`;
  return forms[key] ?? nominative;
}
