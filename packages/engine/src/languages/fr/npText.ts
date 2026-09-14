import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../resolved/possessedHeadForms.js';
import { artFor } from './artFor.js';
import { renderNP } from './renderNP.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("un mot"). */
export function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => artFor(possessedHeadForms(np, 'bare'), plural, lead));
}
