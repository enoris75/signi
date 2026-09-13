import { firstConjunct, mannerRelation, type ResolvedNounElement, type RubySegment } from '../../types.js';
import { JA_NEGATIVE_DETERMINER } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { isNegativeGroup } from './isNegativeGroup.js';

/**
 * A manner-definition gloss fragment ("高い速さで" — at high speed): the manner noun phrase (its
 * degree adjective attributive, its determiner placed by the ordinary NP path) closed by the manner
 * particle — the で the means/measure/mode relations share, or 〜のように for a similative head, exactly
 * as a `manner` complement closes. Unlike the が-predicate dimension gloss, this is an adverbial.
 */
export function mannerGlossSegs(el: ResolvedNounElement): RubySegment[] {
  // A negative-frequency gloss (NEVER → どの時間もない): the circumfix's ない replaces the manner
  // adverbial — どの時間もでない is not Japanese — so drop the manner で and close the verbless
  // fragment with も and ない (npSegs lays down only the どの).
  if (isNegativeGroup(el)) return [...elSegs(el), { t: JA_NEGATIVE_DETERMINER.post }, { t: 'ない' }];
  const particle = mannerRelation(firstConjunct(el).head.forms) === 'similative' ? 'のように' : 'で';
  return [...elSegs(el), { t: particle }];
}
