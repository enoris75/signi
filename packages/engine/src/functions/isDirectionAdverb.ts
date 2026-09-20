import type { ConceptForms } from '../types.js';

/**
 * An adverb of direction (up / down). It says where the object ends up, so it is a complement of the
 * verb rather than a comment on the action: it stands right after the verb or its object and before
 * the other complements, where a manner adverb takes the clause's edge (A142, A156).
 */
export function isDirectionAdverb(a?: ConceptForms): boolean {
  return a?.forms['subtype'] === 'direction';
}
