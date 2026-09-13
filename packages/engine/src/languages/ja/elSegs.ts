import type { ResolvedNounElement, RubySegment } from '../../types.js';
import { npSegs } from './npSegs.js';

/**
 * A whole noun slot: its conjuncts strung together the Japanese way. Japanese repeats the
 * conjunction between *every* pair and writes no comma — 猫と犬と狐 — where the European
 * languages comma all but the last ("the cat, the dog and the fox"). と is the exhaustive "and";
 * か the disjunctive "or".
 *
 * The case particle (は / を / に) is NOT emitted here: it attaches once, to the group as a
 * whole (「猫と犬は」, not 「猫はと犬は」), so every caller appends it after these segments —
 * which is exactly what they already did for a single phrase.
 */
export function elSegs(el: ResolvedNounElement): RubySegment[] {
  const word = el.conjunction === 'or' ? 'か' : 'と';
  const segs: RubySegment[] = [];
  el.conjuncts.forEach((np, i) => {
    if (i > 0) segs.push({ t: word });
    segs.push(...npSegs(np));
  });
  return segs;
}
