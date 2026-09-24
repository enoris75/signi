import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { JA_SOU } from './ja.consts.js';
import { slotSegs } from './slotSegs.js';
import { isAnimate } from './isAnimate.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { isPossessiveExistential } from './isPossessiveExistential.js';
import { jaAgentParticle } from './jaAgentParticle.js';
import { predicateSegs } from './predicateSegs.js';

/**
 * The segments of a noun phrase's relative clause, empty without one. `npSegs` puts them before the
 * head; a headless relative-clause gloss (see NounPhrase.relativeGloss) says them alone (保存した).
 *
 * A relative clause is prenominal in Japanese: the whole predicate precedes the head noun with no
 * relative pronoun (泣いた少年 = "the boy who cried"). For a non-subject (e.g. object) relative the
 * clause's own subject leads, marked by が (私が読む本 = "the book I read"); the gap slot is already
 * absent from the clause. The clause verb takes the *plain* form (食べた猫 "the cat that ate…"), not
 * the polite ます/ました of a main clause — Japanese requires plain form on a prenominal predicate
 * (see plainVerbSeg), so the predicate is built with `plain` set.
 */
export function relativeClauseSegs(np: ResolvedNounPhrase): RubySegment[] {
  const rel = np.relative;
  if (!rel) return [];
  // The clause's subject is the head itself for a subject relative, else its own subject.
  const relAnimate = isAnimate(rel.headRole !== 'subject' && rel.subject ? rel.subject.conjuncts : [np]);
  // A generic ("one") subject is dropped, leaving the bare prenominal clause (食べる物 "a thing one
  // eats"); a specific non-subject relative leads with its own subject marked by が (私が読む本). The
  // owner in an existential possession is marked に instead: 家にある壁 "the wall the house has" (A150).
  const clauseSubjectParticle = isPossessiveExistential(rel.verbPhrase.verb, relAnimate) ? 'に' : 'が';
  const clauseSubjectSegs: RubySegment[] =
    rel.headRole !== 'subject' && rel.subject && !isGenericSubject(rel.subject)
      ? [...slotSegs(rel.subject, clauseSubjectParticle)] : [];
  // A passive relative's agent follows its subject, as in a main clause, and the clause precedes the
  // head all the same: アフリカに読まれる本 "the book that is read by Africa". (Japanese relativises no
  // agent, so the head is never the one gapped here — see RELATIVIZES_AGENT.)
  const agentSegs: RubySegment[] = rel.agent
    ? [...slotSegs(rel.agent, jaAgentParticle(rel.complements))] : [];
  const relSubjNeg = rel.headRole !== 'subject' && rel.subject ? isNegativeGroup(rel.subject) : false;
  // A head that fills the copula's subject complement leaves a gap Japanese cannot leave empty: the
  // pro-form そう takes its place, with the plain copula a relative takes (犬がそうではない伝説, 犬がそう
  // である猫), rather than the existential a copula with no complement would be (A123).
  const complements = rel.headRole === 'predicative' && rel.verbPhrase.verb.forms['copula'] === '1'
    ? { ...rel.complements, predicative: JA_SOU }
    : rel.complements;
  // A head that fills the object slot is the thing possessed of an existential possession, and picks
  // its verb: 家にいる猫, 家にある壁 (A217).
  const animateObject = rel.headRole === 'directObject' ? isAnimate([np]) : undefined;
  return [...clauseSubjectSegs, ...agentSegs, ...predicateSegs(rel.verbPhrase, rel.directObject, complements, undefined, true, relSubjNeg, relAnimate, animateObject)];
}
