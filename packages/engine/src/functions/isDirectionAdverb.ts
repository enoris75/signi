import type { ConceptForms } from '../types.js';

/**
 * An adverb of direction (up / down). It says where the object ends up, so it is a complement of the
 * verb rather than a comment on the action: it stands right after the verb or its object and before
 * the other complements, where a manner adverb takes the clause's edge (A142, A156).
 *
 * An adverb of place (everywhere) stands there too. It says where the action happens, as a locative
 * complement does, and a locative follows the object: "mange la souris partout", "come el ratón en
 * todas partes", where the manner slot gave "mange partout la souris" (localization B41).
 */
export function isDirectionAdverb(a?: ConceptForms): boolean {
  const subtype = a?.forms['subtype'];
  return subtype === 'direction' || subtype === 'place';
}
