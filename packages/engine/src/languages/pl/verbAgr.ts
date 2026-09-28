import type { ResolvedNounPhrase } from '../../types.js';
import { CARDINALS, QUANTIFIERS } from './pl.consts.js';
import { nounAgr } from './nounAgr.js';
import type { VerbAgr } from './pl.types.js';

/** The 3rd singular neuter a quantified subject takes: *wiele kotów je*, *pięć kotów zjadło* (P05 §0.4). */
const NEUTER: VerbAgr = { person: '3', plural: false, gender: 'neut', virile: false };

/**
 * What the finite verb agrees with, read off the subject's agreement forms (P05 §2.2). A subject under
 * a quantifier that governs the genitive (*kilka, wiele, mało*), under a numeral from five, or under a
 * virile numeral (*dwóch chłopców*) is 3rd singular neuter; under *większość* 3rd singular feminine
 * (*większość kotów zjadła*). The generic *się* is 3rd singular neuter (*zjadło się*, D5). Otherwise
 * the person, number and gender, the 1st and 2nd person masculine unless the plan says otherwise.
 * A coordinated subject (`conjuncts`, more than one) is plural, virile when any conjunct is.
 */
export function verbAgr(forms: Record<string, string>, conjuncts?: ResolvedNounPhrase[]): VerbAgr {
  const person = forms['person'] === '1' || forms['person'] === '2' ? forms['person'] : '3';
  if (conjuncts && conjuncts.length > 1) {
    const virile = conjuncts.some((np) => nounAgr({ ...np.head.forms, number: 'plural' }).virile);
    const g = forms['gender'];
    return { person, plural: true, gender: g === 'fem' || g === 'neut' ? g : 'masc', virile };
  }
  if (forms['generic'] === '1') return NEUTER;
  const agr = nounAgr(forms);
  const det = forms['definiteness'];
  if (!forms['person'] && det === 'most') return { person: '3', plural: false, gender: 'fem', virile: false };
  if (!forms['person'] && det && QUANTIFIERS[det]) return NEUTER;
  const numeral = Number(forms['numeral'] ?? 0);
  if (numeral > 1 && (agr.virile || !CARDINALS[numeral]?.small)) return NEUTER;
  return { person, plural: agr.plural, gender: agr.gender, virile: agr.virile };
}
