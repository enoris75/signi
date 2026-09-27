import { agreeByRule } from './agreeByRule.js';

/**
 * An adjective agreeing with its noun in gender and number, read from the four forms the column
 * stores for every adjective (`base`, `fem`, `masc_plural`, `fem_plural`, P04-E4) — RG's are not all
 * derivable (*vegl, veglia*; *pitschen, pitschna*). A form the lexeme lacks is derived by the
 * participle rule (`agreeByRule`).
 */
export function agreeAdj(forms: Record<string, string>, gender: string, plural: boolean): string {
  const base = forms['base'] ?? '';
  if (!base) return '';
  const fem = gender === 'fem';
  const key = plural ? (fem ? 'fem_plural' : 'masc_plural') : fem ? 'fem' : 'base';
  return forms[key] ?? agreeByRule(base, fem, plural);
}
