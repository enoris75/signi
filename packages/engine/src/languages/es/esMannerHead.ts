import { mannerRelation } from '../../functions/mannerRelation.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * The manner adposition for a noun, contracting with its article — the same selection the `manner`
 * complement makes: means "con", measure "a" (→ al / a la), mode "de" (→ del / de la), similative
 * "como". Shared so the gloss and the complement never drift.
 */
export function esMannerHead(af: Record<string, string>, plural: boolean): string {
  return mannerRelation(af) === 'means'   ? prepDet('con', af, plural) :
         mannerRelation(af) === 'measure' ? aDet(af, plural) :
         mannerRelation(af) === 'mode'    ? deDet(af, plural) :
         prepDet('como', af, plural);
}
