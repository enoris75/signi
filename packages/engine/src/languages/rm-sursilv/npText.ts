import type { ResolvedNounPhrase } from '../../types.js';
import { sursilvPossessedHeadForms } from './sursilvPossessedHeadForms.js';
import { sursilvArticle } from './sursilvArticle.js';
import { renderNP } from './renderNP.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("in pled"). */
export function npText(np: ResolvedNounPhrase): string {
  return renderNP(np, (plural, lead) => sursilvArticle(sursilvPossessedHeadForms(np), plural, lead));
}
