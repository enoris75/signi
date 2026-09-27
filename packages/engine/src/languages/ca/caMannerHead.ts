import { mannerRelation } from '../../functions/mannerRelation.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * The manner adposition for a noun, with its article — the same selection the `manner` complement
 * makes: means *amb* ("amb cura"), measure *a* ("a gran velocitat", "a la velocitat de la llum"), mode
 * *de* ("de manera …"), similative *com* ("com el vent"). Shared so the gloss and the complement never
 * drift.
 */
export function caMannerHead(af: Record<string, string>, plural: boolean): string {
  return mannerRelation(af) === 'means'   ? prepDet('amb', af, plural) :
         mannerRelation(af) === 'measure' ? aDet(af, plural) :
         mannerRelation(af) === 'mode'    ? deDet(af, plural) :
         prepDet('com', af, plural);
}
