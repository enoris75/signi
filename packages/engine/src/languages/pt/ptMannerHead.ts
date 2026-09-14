import { mannerRelation } from '../../functions/mannerRelation.js';
import { contractDet } from './contractDet.js';
import { datPrep } from './datPrep.js';
import { dePrep } from './dePrep.js';
import { prepDet } from './prepDet.js';

/**
 * The manner adposition for a noun, contracting with its article — the same selection the `manner`
 * complement makes: means "com", measure "a" (→ ao / à), mode "de" (→ do / da), similative "como".
 * Shared so the gloss and the complement never drift.
 */
export function ptMannerHead(f: Record<string, string>, plural: boolean): string {
  return mannerRelation(f) === 'means'   ? prepDet('com', f, plural) :
         mannerRelation(f) === 'measure' ? contractDet(datPrep, 'a', f, plural) :
         mannerRelation(f) === 'mode'    ? contractDet(dePrep, 'de', f, plural) :
         prepDet('como', f, plural);
}
