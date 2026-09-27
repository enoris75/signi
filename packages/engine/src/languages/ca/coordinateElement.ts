import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { CORRELATIVE_PAIR } from './ca.consts.js';

/**
 * Render every conjunct of a noun slot and coordinate them: commas between all but the last pair, the
 * conjunction on the last ("el gat, el gos i la guineu"). *I* and *o* keep their form before any
 * sound (unlike es *y → e*, *o → u*).
 *
 * `afterVerb` marks a slot after the verb. There a last conjunct determined *cap* is linked with *ni*
 * under either conjunction, the verb carrying the concord *no*: "no veig cap nen ni cap nena". A
 * subject group before the verb keeps *i* / *o*.
 */
export function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string, afterVerb = false): string {
  const last = el.conjuncts[el.conjuncts.length - 1];
  const ni = afterVerb && (el.conjunction === 'and' || el.conjunction === 'or') && last?.head.forms['definiteness'] === 'no';
  const link = () => (ni ? ' ni ' : el.conjunction === 'or' ? ' o ' : ' i ');
  const parts = el.conjuncts.map(render);
  // "tant el gat com el gos" (P09-E26) — never over the concord "ni", which keeps its own join.
  return (ni ? undefined : correlate(el, parts, CORRELATIVE_PAIR)) ?? joinConjuncts(parts, ', ', link);
}
