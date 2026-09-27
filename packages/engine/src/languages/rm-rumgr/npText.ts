import type { ResolvedNounPhrase } from '../../types.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';
import { rgArticle } from './rgArticle.js';
import { renderNP } from './renderNP.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("in pled"). */
export function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => rgArticle(rgPossessedHeadForms(np), plural, lead));
}
