import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { JA_DEGREE } from './ja.consts.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { wordSeg } from './wordSeg.js';

/**
 * An adjective-definition gloss fragment ("大きさが大きい" — of great size): the dimension noun
 * (the head) marked with が, then its degree adjective in plain form (an い-adjective stays 大きい;
 * a na-adjective drops the attributive な). Japanese has no adposition here — the が-predicate is
 * the natural gloss — so, unlike the other engines, it does not read the `dimensionRelation`.
 */
export function dimensionGlossSegs(np: ResolvedNounPhrase): RubySegment[] {
  const nounSeg = wordSeg(np.head.forms['base'] ?? '', np.head.forms['reading']);
  const adj = np.adjectives[0];
  if (!adj) return [nounSeg];
  const { base, reading } = jaComparisonAdj(adj);
  const na = base.endsWith('な');
  const adjSeg = wordSeg(na ? base.slice(0, -1) : base, na && reading?.endsWith('な') ? reading.slice(0, -1) : reading);
  const deg = JA_DEGREE[adjDegree(adj)];
  const degSegs: RubySegment[] = deg ? [{ t: deg }] : [];
  return [nounSeg, { t: 'が' }, ...degSegs, adjSeg];
}
