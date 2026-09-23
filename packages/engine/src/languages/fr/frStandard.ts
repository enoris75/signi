import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { FR_DOMAIN, FR_DOMAIN_PRONOUN, FR_STANDARD, VOWEL_START } from './fr.consts.js';
import { joinArt } from './joinArt.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a compared adjective `adj` — "que le chien" — or '' where it has
 * none (P09-E5). "que" leads the whole group ("plus grand que le chien et l'homme") and elides
 * before a vowel as it always does ("qu'un chien", "qu'elle"). A pronoun takes its tonic form: "plus
 * grand que moi", "que lui", never the clitic "*que je".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition "de", fused with each conjunct's article and so repeated per conjunct ("le plus grand
 * des animaux et des hommes", "de la famille"), and "d'entre" before a personal pronoun, which never
 * takes the bare "de" ("le plus grand d'entre nous", not "*de nous").
 *
 * `adj` is the predicate adjective or an attributive one (P09-E18): "un chat plus grand que le chien".
 */
export function frStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  if (!standard) return '';
  if (adj.forms['domain'] === '1') {
    return coordinate(standard, (s) => {
      const tonic = tonicPronoun(s);
      return tonic !== undefined ? `${FR_DOMAIN_PRONOUN} ${tonic}` : prepObjectText(s, FR_DOMAIN);
    });
  }
  const word = FR_STANDARD[adjDegree(adj)];
  if (!word) return '';
  const group = coordinate(standard, (s) => tonicPronoun(s) ?? npText(s));
  return joinArt(VOWEL_START.test(group) ? "qu'" : word, group);
}
