import { headPreposition } from '../../functions/headPreposition.js';
import { PT_DE_FUSING_PRONOUN } from './pt.consts.js';

/**
 * A bare adposition + the tonic form of a pronoun, fused where Portuguese fuses the two: "em" and
 * "de" contract with the 3rd-person tonic forms as obligatorily as they do with the article — em +
 * ele → nele, de + elas → delas — wherever one of them ends the head, which includes the locutions
 * built on "de" ("debaixo dele", "longe dele"). Every other preposition simply leads the pronoun:
 * "por ele", "a ele", "como ele", "para ele". A203, the counterpart of what `prepObjectText`
 * already does for a verb's prepositional object (A139).
 */
export function tonicPhrase(head: string, tonic: string): string {
  const prep = headPreposition(head);
  if ((prep === 'em' || prep === 'de') && PT_DE_FUSING_PRONOUN.test(tonic)) {
    return `${head.slice(0, head.length - prep.length)}${prep === 'em' ? 'n' : 'd'}${tonic}`;
  }
  return `${head} ${tonic}`;
}
