import type { ResolvedNounPhrase } from '../../types.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { artFor } from './artFor.js';
import { renderNP } from './renderNP.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("una parola"). */
export function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => artFor(itPossessedHeadForms(np), plural, lead));
}
