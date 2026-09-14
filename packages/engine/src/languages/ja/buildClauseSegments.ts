import type { ResolvedPhrase, RubySegment } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { dimensionGlossSegs } from './dimensionGlossSegs.js';
import { elSegs } from './elSegs.js';
import { isAnimate } from './isAnimate.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaImperativePN } from './jaImperativePN.js';
import { jaParticleSegs } from './jaParticleSegs.js';
import { mannerGlossSegs } from './mannerGlossSegs.js';
import { predicateSegs } from './predicateSegs.js';

/**
 * Japanese word order: S 〈complements, recipient に〉 DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
export function buildClauseSegments(phrase: ResolvedPhrase, subjectParticle: string): RubySegment[] {
  // A verbless period marked as an adjective-definition gloss is a が-predicate ("大きさが大きい"),
  // not a bare noun-phrase title — render the dimension noun + が + its degree adjective.
  if (!phrase.verbPhrase && isDimensionGloss(phrase.subject)) return dimensionGlossSegs(firstConjunct(phrase.subject));
  // A manner-definition gloss ("高い速さで") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(phrase.subject)) return mannerGlossSegs(phrase.subject);
  // Verbless period: a bare noun phrase (a title like "最新ニュース") — no topic は, no predicate.
  if (!phrase.verbPhrase) return elSegs(phrase.subject);
  const segs: RubySegment[] = [];
  // An imperative drops its subject/topic; the subject's person still selects the form. An
  // infinitive citation (「食物を消費する」) is likewise subject-less on the surface.
  const imperative = phrase.verbPhrase.mood === 'imperative';
  const dropsSubject = imperative || phrase.verbPhrase.mood === 'infinitive';
  // One topic particle for the whole subject, coordinated or not: 「ピーターとパウロは」.
  const subjectNegative = isNegativeGroup(phrase.subject);
  // A `no` subject's も replaces the topic/subject particle (どの時間も, not どの時間もは).
  if (!dropsSubject) segs.push(...elSegs(phrase.subject), ...jaParticleSegs(phrase.subject, subjectParticle));
  const impPN = imperative ? jaImperativePN(phrase.subject.agreement) : undefined;
  segs.push(...predicateSegs(phrase.verbPhrase, phrase.directObject, phrase.complements, impPN, false, subjectNegative, isAnimate(phrase.subject.conjuncts)));
  return segs;
}
