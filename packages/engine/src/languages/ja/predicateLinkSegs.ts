import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { JA_ICHIDAN } from './ja.consts.js';
import type { JaVerbRow, PredicateLink } from './ja.types.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';
import { npSegs } from './npSegs.js';
import { wordSeg } from './wordSeg.js';

// The connective each class of conjunct takes, as [non-past, past]. Only `ka` tells the tenses apart.
const TAILS: Record<'i' | 'na' | 'ta', Record<PredicateLink, [present: string, past: string]>> = {
  i: { te: ['くて', 'くて'], mo: ['くも', 'くも'], ka: ['いか', 'かったか'] },
  na: { te: ['で', 'で'], mo: ['でも', 'でも'], ka: ['か', 'だったか'] },
  ta: { te: ['いて', 'いて'], mo: ['も', 'も'], ka: ['いるか', 'いたか'] },
};
// A verb links as one, on its own row (see `JaVerbRow`): an intensifier's 〜すぎる as 大きすぎて,
// 大きすぎも, 大きすぎるか (C33), and a godan verb as 違って, 違いも, 違うか (localization B87). A verb's
// "neither … nor" is its stem + も, closed on しない; the te-form + も would be the concessive
// "even if" (大きすぎても — A366).
const verbTails = (v: JaVerbRow): Record<PredicateLink, [present: string, past: string]> => ({
  te: [v.te, v.te], mo: [`${v.i}も`, `${v.i}も`], ka: [`${v.u}か`, `${v.ta}か`],
});

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
  const { base, reading, verbal } = jaComparisonAdj(np.head);
  // A relational の-adjective keeps its の here too: this is the predicate position, one conjunct
  // earlier (アメリカので, アメリカのでも — A246).
  const { kind, stem, reading: stemReading, predicative, verb } = jaAdjClass(base, reading, np.head.forms['relational'] === '1', verbal);
  const tails = kind === 'ru' ? verbTails(verb ?? JA_ICHIDAN) : TAILS[kind];
  return [...jaDegreeSegs(np.head, np.standard), wordSeg(stem, stemReading), { t: `${predicative}${tails[link][cell]}` }];
}
