import type { ResolvedNounPhrase } from '../../types.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { vlArticle } from './vlArticle.js';
import { renderNP } from './renderNP.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("ün pled"). */
export function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => vlArticle(vlPossessedHeadForms(np), plural, lead));
}
