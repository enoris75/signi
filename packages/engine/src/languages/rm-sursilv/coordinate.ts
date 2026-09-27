import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { AND_BEFORE_VOWEL, COORD_WORDS, CORRELATIVE_PAIR, VOWEL_START } from './sursilv.consts.js';

/**
 * *and* before the word that follows it (style sheet): *e*, and *ed* before a vowel — "il gat ed igl
 * um", "ferm ed attent" (P04-E15 D3, where RG keeps *e*).
 */
export function andLink(next: string): string {
  return ` ${VOWEL_START.test(next) ? AND_BEFORE_VOWEL : COORD_WORDS.and} `;
}

/**
 * Render every conjunct of a noun slot and coordinate them: commas between all but the last pair, the
 * conjunction on the last ("il gat, il tgaun e la vulp"); *and* is *ed* before a vowel (`andLink`).
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const parts = el.conjuncts.map(render);
  // "tant il gat sco il tgaun" (P09-E26).
  return correlate(el, parts, CORRELATIVE_PAIR)
    ?? joinConjuncts(parts, ', ', el.conjunction === 'or' ? () => ` ${COORD_WORDS.or} ` : andLink);
}
