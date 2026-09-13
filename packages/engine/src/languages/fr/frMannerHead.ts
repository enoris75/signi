import { mannerRelation } from '../../types.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';

/**
 * The manner adposition for a noun, contracting with its article — the same selection the `manner`
 * complement makes (see the complement branch): similative "comme", means "avec", measure "à" (→ au
 * / à la / aux), mode "de" (→ du / de la / des, elided "d'"). Shared so the gloss and the complement
 * never drift.
 */
export const frMannerHead = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
  mannerRelation(nf) === 'means'   ? prepDet('avec', nf, plural, lead) :
  mannerRelation(nf) === 'measure' ? aDet(nf, plural, lead) :
  mannerRelation(nf) === 'mode'    ? deDet(nf, plural, lead) :
  prepDet('comme', nf, plural, lead);
