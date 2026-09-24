import type { ConceptForms } from '../types.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

/**
 * The word a negative adverb puts **in front of the clause's own negator**, where the adverb's surface
 * already is that negator with a word before it: Spanish NO_LONGER is *ya no*, Portuguese *já não*.
 * The lexeme names the leading word (`negator_lead`), or the adverb has none and this is ''.
 *
 * A finite clause fronts every negative adverb in place of its "no" / "não" ("el gato ya no corre"),
 * so it needs none of this. The clauses that write the negator themselves do: the infinitive ("no
 * correr"), the command ("no corras", "não corra") and the group a modal governs ("puede no correr").
 * There the adverb cannot trail the verb as NEVER does ("no correr nunca"), because it would say its
 * "no" a second time — *no correr ya no* (localization B84). It leads the negator instead, and is not
 * said again: "ya no correr", "já não se mover", "ya no corras", "puede ya no correr".
 */
export function negatorLead(modifier: ConceptForms | undefined): string {
  return isNegativeAdverb(modifier) ? (modifier?.forms['negator_lead'] ?? '') : '';
}
