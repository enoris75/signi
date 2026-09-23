import type { ResolvedNounPhrase } from '../../types.js';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import { genitiveMarker } from './genitiveMarker.js';
import { possessorPhrase } from './possessorPhrase.js';

/**
 * A possessor rendered as a Saxon-genitive prefix ("the cat's "). The possessor is a
 * definite noun phrase (recursing for its own possessor / relative clause) followed by
 * the genitive marker; the possessed head drops its own article.
 */
export function possessivePrefix(poss: ResolvedNounPhrase): string {
  // A possessor question's stand-in is *whose*, which is its own genitive: "whose food" (P09-E14).
  if (isQuestionPossessor(poss)) return 'whose ';
  return `${possessorPhrase(poss)}${genitiveMarker(poss)} `;
}
