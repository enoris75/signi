import type { ResolvedNounPhrase } from '../../types.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

/**
 * One conjunct of the object of a verb that takes it with a preposition (A139): the verb's
 * `object_prep` with the article, as a complement's is — "el clicca sin il buttun", "el dependa da la
 * chasa", "el telefona al giat". A pronoun takes its tonic form: "sin mai", "ad el". A two-word
 * preposition (*vi da*) contracts through its last word: "vi dal giat".
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const f = np.head.forms;
  const words = prep.split(' ');
  const last = words.pop()!;
  const lead = words.join(' ');
  if (f['person']) {
    const tonic = f['disjunctive'] ?? f['base'] ?? '';
    return withRelative([lead, adBeforeVowel(last, tonic), tonic].filter(Boolean).join(' '), np);
  }
  const head = (plural: boolean, first: string) => [lead, prepDet(last, rgPossessedHeadForms(np), plural, first)].filter(Boolean).join(' ');
  return renderNP(np, head);
}
