import type { ResolvedNounElement } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { COORD_WORDS, CORRELATIVE_PAIR, FOCUS_WORDS } from './lt.consts.js';
import { nounPhrase } from './nounPhrase.js';
import type { Case, NpContext } from './lt.types.js';

/**
 * A noun slot in one case: each conjunct declined on its own and coordinated (*katė ir šuo*, *katė, šuo
 * ir lapė*, *katė arba šuo*), or the correlative pair (*ir katė, ir šuo*, P09-E46), and the focus
 * particle singling the slot out (*tik katė*, *katė irgi*, C39).
 */
export function elementText(el: ResolvedNounElement, kase: Case, ctx: NpContext = {}): string {
  const parts = el.conjuncts.map((np) => nounPhrase(np, kase, ctx));
  const word = COORD_WORDS[el.conjunction ?? 'and'];
  const pair = correlate(el, parts, [CORRELATIVE_PAIR[0], `, ${CORRELATIVE_PAIR[1]}`]);
  const joined = pair?.replace(/ ,/g, ',') ?? joinConjuncts(parts, ', ', () => ` ${word} `);
  return withFocus(joined, slotFocus(el), FOCUS_WORDS);
}
