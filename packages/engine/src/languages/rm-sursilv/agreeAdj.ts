import { agreeByRule } from './agreeByRule.js';

/**
 * An adjective agreeing with its noun in gender and number, read from the forms the column stores for
 * every adjective (`base`, `fem`, `masc_plural`, `fem_plural`, P04-E5) — Sursilvan's are not all
 * derivable (*pign, pintga*; *bi, bella, bials*). A form the lexeme lacks is derived by the participle
 * rule (`agreeByRule`).
 *
 * `predicative` (P04-E9): the adjective stands in the predicate — the translator's `position:
 * 'predicative'` on a copula's or BECOME's adjective — and its masculine singular is the stored
 * `predicative_masc_sg`, Sursilvan's *-s*: "in paun bun", but "il paun ei buns". The other three
 * cells are the attributive ones (the style sheet: the masculine plural is *buns* in both positions).
 */
export function agreeAdj(forms: Record<string, string>, gender: string, plural: boolean, predicative = false): string {
  const base = forms['base'] ?? '';
  if (!base) return '';
  const fem = gender === 'fem';
  if (predicative && !fem && !plural && forms['predicative_masc_sg']) return forms['predicative_masc_sg'];
  const key = plural ? (fem ? 'fem_plural' : 'masc_plural') : fem ? 'fem' : 'base';
  return forms[key] ?? agreeByRule(base, fem, plural);
}
