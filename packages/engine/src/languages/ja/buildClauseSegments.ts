import type { ResolvedPhrase, RubySegment } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { dimensionGlossSegs } from './dimensionGlossSegs.js';
import { elSegs } from './elSegs.js';
import { isAnimate } from './isAnimate.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { isPossessiveExistential } from './isPossessiveExistential.js';
import { JA_NEGATIVE_DETERMINER, JA_SURU } from './ja.consts.js';
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
  // Verbless period: a bare noun phrase (a title like "最新ニュース") — no topic は, no predicate. A
  // `no` group still closes its どの … も circumfix on ない, which no predicate is there to supply
  // ("どの保存済みのフレーズもない", "no saved phrases"), as the manner gloss does.
  if (!phrase.verbPhrase) {
    return isNegativeGroup(phrase.subject)
      ? [...elSegs(phrase.subject), { t: JA_NEGATIVE_DETERMINER.post }, { t: 'ない' }]
      : elSegs(phrase.subject);
  }
  const segs: RubySegment[] = [];
  // An imperative drops its subject/topic; the subject's person still selects the form. An
  // infinitive citation (「食物を消費する」) is likewise subject-less on the surface.
  const imperative = phrase.verbPhrase.mood === 'imperative';
  const dropsSubject = imperative || phrase.verbPhrase.mood === 'infinitive';
  // One topic particle for the whole subject, coordinated or not: 「ピーターとパウロは」.
  const subjectNegative = isNegativeGroup(phrase.subject);
  const animate = isAnimate(phrase.subject.conjuncts);
  // The owner in an existential possession is where the thing is, so an "if" clause marks it with に,
  // not が (もし家に壁があったら, A150). The topic は stays (家は壁があります).
  const particle = subjectParticle === 'が' && isPossessiveExistential(phrase.verbPhrase.verb, animate) ? 'に' : subjectParticle;
  // A `no` subject's も replaces the topic/subject particle (どの時間も, not どの時間もは).
  if (!dropsSubject) segs.push(...elSegs(phrase.subject), ...jaParticleSegs(phrase.subject, particle));
  // An infinitive complement is a nominalized clause ahead of the predicate governing it, closed by
  // the tail the governor's lexeme names (`infinitive_link`, ことを by default): 行動することが可能です,
  // 食べ物を食べることを望みます, and ように for the causative below. The clause is itself a citation, in
  // the dictionary form, and may govern one in turn (行動することが可能であることを望む). Negated, it
  // inherits the citation's polite negative (B13).
  // Under object control the controller is the one that acts, so Japanese speaks it *inside* the
  // clause with が (人が物体を見るようにする) instead of leaving it in the matrix object slot.
  const causee = phrase.infinitiveComplement?.control === 'object' ? phrase.directObject : undefined;
  if (phrase.infinitiveComplement) {
    if (causee) segs.push(...elSegs(causee), ...jaParticleSegs(causee, 'が'));
    segs.push(...buildClauseSegments(phrase.infinitiveComplement, subjectParticle), { t: infinitiveLink(phrase) || 'ことを' });
  }
  const impPN = imperative ? jaImperativePN(phrase.subject.agreement) : undefined;
  // Japanese has no transitive verb "to cause" that governs a clause: the causative is the ようにする
  // construction, and its light verb する is what closes the predicate. The lexeme's own word
  // (引き起こす, what the verb says standing alone) would not take a ように clause, so the construction
  // supplies する in its place — the substitution the existential already makes for the copula.
  const verbPhrase = causee && phrase.verbPhrase.verb.forms['causative'] === '1'
    ? { ...phrase.verbPhrase, verb: JA_SURU }
    : phrase.verbPhrase;
  segs.push(...predicateSegs(verbPhrase, causee ? undefined : phrase.directObject, phrase.complements, impPN, false, subjectNegative, animate));
  return segs;
}
