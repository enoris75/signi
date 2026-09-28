import type { Agr, Gender } from './lt.types.js';

/**
 * What a word agreeing with this head reads (P18 §2.1): its gender and number. A plurale tantum
 * (*pinigai, durys*) agrees as a plural whatever number the plan asked for (style-lt.md). A noun has
 * no neuter; a head with no gender at all (an indefinite *kažkas*, a borrowed word) agrees as a
 * masculine.
 */
export function nounAgr(forms: Record<string, string>): Agr {
  const plural = forms['plurale_tantum'] === '1' || forms['number'] === 'plural';
  const gender: Gender = forms['gender'] === 'fem' ? 'fem' : 'masc';
  return { gender, plural };
}
