import type { Case } from './gsw.types.js';

/**
 * The Swiss German definite article (P10-E5 D3): the clitics *de / d / s*, plural *d*, and the
 * dative *em / de / em*, plural *de*. Nominative and accusative are one form (P10 D7) — the table maps
 * `acc` onto `nom` rather than every caller — and there is no genitive: a `gen` caller gets the dative,
 * which is what Swiss German puts in the genitive's place (the possessor dative, P10-E12). Written
 * apart from the noun, with no apostrophe (the Dieth style sheet): *d Chatz*, *s Huus*.
 */
export function defArticle(forms: Record<string, string>, _case: Case, plural = false): string {
  const dative = _case === 'dat' || _case === 'gen';
  if (plural) return dative ? 'de' : 'd';
  const gender = forms['gender'] ?? 'neut';
  if (dative) return gender === 'fem' ? 'de' : 'em';
  return gender === 'masc' ? 'de' : gender === 'fem' ? 'd' : 's';
}
