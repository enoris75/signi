import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { COORD_WORDS, CORRELATIVE_PAIR } from './rumgr.consts.js';

/**
 * Render every conjunct of a noun slot and coordinate them: commas between all but the last pair, the
 * conjunction on the last ("il giat, il chaun e la vulp"). *e* stays *e* before a vowel (P04-E15 D3:
 * no euphonic *ed*, verify).
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = el.conjunction === 'or' ? ` ${COORD_WORDS.or} ` : ` ${COORD_WORDS.and} `;
  const parts = el.conjuncts.map(render);
  // "tant il giat sco il chaun" (P09-E26).
  return correlate(el, parts, CORRELATIVE_PAIR) ?? joinConjuncts(parts, ', ', () => link);
}
