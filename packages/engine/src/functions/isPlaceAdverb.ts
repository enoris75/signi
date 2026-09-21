import type { ConceptForms } from '../types.js';

/**
 * An adverb of place (everywhere). It says where the action happens, the way a locative complement
 * does, so it stands where a locative stands: after the object and after the complements the verb
 * takes, just ahead of a locative and of the causal adjunct — "mange la souris partout", "seems
 * tired everywhere", "gives the book to the dog everywhere" (localization B41, A189).
 *
 * That is not the direction adverb's slot: UP and DOWN are particles of the verb and lead the
 * complements instead ([`isDirectionAdverb`](./isDirectionAdverb.ts), A156).
 */
export function isPlaceAdverb(a?: ConceptForms): boolean {
  return a?.forms['subtype'] === 'place';
}
