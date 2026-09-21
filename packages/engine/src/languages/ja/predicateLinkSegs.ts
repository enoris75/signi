import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { JA_DEGREE } from './ja.consts.js';
import type { PredicateLink } from './ja.types.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { npSegs } from './npSegs.js';
import { wordSeg } from './wordSeg.js';

// The connective each class of conjunct takes, as [non-past, past]. Only `ka` tells the tenses apart.
const TAILS: Record<'i' | 'na' | 'ta', Record<PredicateLink, [present: string, past: string]>> = {
  i: { te: ['くて', 'くて'], mo: ['くも', 'くも'], ka: ['いか', 'かったか'] },
  na: { te: ['で', 'で'], mo: ['でも', 'でも'], ka: ['か', 'だったか'] },
  ta: { te: ['いて', 'いて'], mo: ['も', 'も'], ka: ['いるか', 'いたか'] },
};

/**
 * A non-final conjunct of a coordinated predicate, closed by the connective that hands on to the next
 * one (B12). Japanese does not join predicates with と, which joins things (猫と犬): each conjunct takes
 * a connective form of its own, and only the last carries the copula or the に.
 * - `te`, "and": the te-form: i-adjective 〜くて, na-adjective, の-adjective and noun 〜で, た-adjective
 *   〜ていて (大きくて幸せです, 伝説で犬です, 疲れていて幸せです).
 * - `mo`, under negation: 〜も on the same connective, the "neither … nor" of Japanese (大きくも幸せでも
 *   ありません, 疲れても幸せでもない).
 * - `ka`, "or": the plain predicate + か (大きいか幸せです, 伝説か犬です), in the plain past when `past`
 *   (大きかったか幸せでした). A noun and a na-adjective drop the non-past だ before か.
 * Each adjective keeps its own degree adverb (もっと大きくて幸せです).
 */
export function predicateLinkSegs(np: ResolvedNounPhrase, link: PredicateLink, past = false): RubySegment[] {
  const cell = past ? 1 : 0;
  if (np.head.forms['role'] !== 'adjective') return [...npSegs(np), { t: TAILS.na[link][cell] }];
  const { base, reading } = jaComparisonAdj(np.head);
  const { kind, stem, reading: stemReading } = jaAdjClass(base, reading);
  const deg = JA_DEGREE[adjDegree(np.head)];
  return [...(deg ? [{ t: deg }] : []), wordSeg(stem, stemReading), { t: TAILS[kind][link][cell] }];
}
