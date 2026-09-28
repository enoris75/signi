import type { ResolvedNounPhrase } from '../../types.js';
import { nounAgr } from './nounAgr.js';
import type { Gender, VerbAgr } from './lt.types.js';

/**
 * What the verb group agrees with, read off the subject's agreement forms (P18 §2.2). The finite verb
 * reads only the person and number — its 3rd person is one form for both, so a quantified subject
 * (*daug kačių valgo*) needs no rule of its own — and the participles read the gender too (*katės
 * yra suvalgiusios*). A subject with `gender: 'neut'` is genderless (a clause or an infinitive: *buvo
 * nuspręsta*); the generic subject is a masculine 3rd singular. A coordinated subject (`conjuncts`,
 * more than one) is plural, masculine unless every conjunct is feminine.
 */
export function verbAgr(forms: Record<string, string>, conjuncts?: ResolvedNounPhrase[]): VerbAgr {
  const person = forms['person'] === '1' || forms['person'] === '2' ? forms['person'] : '3';
  if (conjuncts && conjuncts.length > 1) {
    const allFem = conjuncts.every((np) => nounAgr(np.head.forms).gender === 'fem');
    return { person, plural: true, gender: allFem ? 'fem' : 'masc' };
  }
  if (forms['generic'] === '1') return { person: '3', plural: false, gender: 'masc' };
  const agr = nounAgr(forms);
  const gender: Gender = forms['gender'] === 'neut' ? 'neut' : agr.gender;
  const counted = Number(forms['numeral'] ?? 0) > 1 || ['many', 'few', 'most', 'enough'].includes(forms['definiteness'] ?? '');
  return { person, plural: agr.plural || (counted && !forms['person']), gender };
}
