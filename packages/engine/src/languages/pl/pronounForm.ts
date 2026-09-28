import { SIEBIE } from './pl.consts.js';
import type { Case } from './pl.types.js';

/**
 * A pronoun in one case (style-pl.md § Pronouns). The variant is read off the resolved person, number
 * and gender: the 3rd person's `fem_`, `neut_`, `plural_` (virile *oni*) and `plural_fem_` (non-virile
 * *one*, which a feminine or neuter plural takes), and *my/wy*'s `plural_`. After a preposition the 3rd
 * person takes its *n*-form (`prep_*`: *do niego, z nią*); `short` asks for the clitic where one exists
 * (*go, mu, mi, cię*). An indefinite pronoun under negation reads its `negative_*` cases (*niczego,
 * nikogo*), and the generic *się* is the reflexive *siebie / sobie / sobą* outside the nominative. A
 * missing cell falls back on the nominative the translator resolved into `base`.
 */
export function pronounForm(forms: Record<string, string>, kase: Case, { afterPrep = false, short = false } = {}): string {
  const base = forms['base'] ?? '';
  if (kase === 'nom' || kase === 'voc') return base;
  if (forms['generic'] === '1') return SIEBIE[kase];
  const person = forms['person'];
  const plural = forms['number'] === 'plural';
  const gender = forms['gender'];
  const negative = forms['definiteness'] === 'no' && forms['negative'] !== undefined;
  const prefix = negative ? 'negative_'
    : plural ? (person === '3' && gender !== 'masc' ? 'plural_fem_' : 'plural_')
    : person === '3' && (gender === 'fem' || gender === 'neut') && forms['indefinite'] !== '1' && forms['thing'] !== '1' ? `${gender}_`
    : '';
  const own = forms[`${prefix}${kase}`];
  const n = afterPrep ? forms[`${prefix}prep_${kase}`] : undefined;
  const clitic = short && !afterPrep ? forms[`${prefix}${kase}_short`] : undefined;
  return n ?? clitic ?? own ?? base;
}
