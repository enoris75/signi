import { SAVES } from './lt.consts.js';
import type { Case } from './lt.types.js';

/**
 * A pronoun in one case (style-lt.md § Pronouns). The variant is read off the resolved person, number
 * and gender: the 3rd person's `fem_` (*ji: jos, jai, ją*), `plural_` (*jie*) and `plural_fem_` (*jos:
 * jų, joms, jas*), and *mes / jūs*'s `plural_`. Lithuanian has no clitic and no post-preposition form.
 * An indefinite pronoun under negation reads its `negative_*` cases (*nieko, niekam*), and the generic
 * subject (D7) is nothing in the nominative — its `base` *žmogus* is a picker label, the clause has
 * no subject — and the reflexive *savęs / sau / save* outside it. A missing cell falls back
 * on the nominative the translator resolved into `base`.
 */
export function pronounForm(forms: Record<string, string>, kase: Case): string {
  const base = forms['base'] ?? '';
  if (forms['generic'] === '1') return kase === 'nom' || kase === 'voc' ? '' : SAVES[kase];
  if (kase === 'nom' || kase === 'voc') return base;
  const person = forms['person'];
  const plural = forms['number'] === 'plural';
  const fem = forms['gender'] === 'fem';
  const negative = forms['definiteness'] === 'no' && forms['negative'] !== undefined;
  const prefix = negative ? 'negative_'
    : plural ? (person === '3' && fem ? 'plural_fem_' : 'plural_')
    : person === '3' && fem && forms['indefinite'] !== '1' && forms['thing'] !== '1' ? 'fem_'
    : '';
  return forms[`${prefix}${kase}`] ?? base;
}
