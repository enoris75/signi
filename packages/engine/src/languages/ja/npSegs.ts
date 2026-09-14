import type { Definiteness } from '@signi/shared';
import { adjDegree, isGenericSubject, isPronominalPossessor, type ResolvedNounPhrase, type RubySegment } from '../../types.js';
import { possessiveJa } from '../../possessive.js';
import { JA_DEGREE, JA_NEGATIVE_DETERMINER, JA_PRENOMINAL_DET, JA_SOU } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { isAnimate } from './isAnimate.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaParticleSegs } from './jaParticleSegs.js';
import { predicateSegs } from './predicateSegs.js';
import { wordSeg } from './wordSeg.js';

/**
 * Segments for a noun phrase: [relative clause] [adjectives] noun. Japanese does not put
 * spaces between words, so stacked adjectives run straight into each other and into the head
 * ("大きい小さい猫"); each one's own attributive marker (な / の) is what keeps them apart.
 * Any relative clause is prepended (see below).
 */
export function npSegs(np: ResolvedNounPhrase): RubySegment[] {
  const core: RubySegment[] = [];
  // The determiner leads the phrase. Japanese spells no article, but the demonstratives and
  // quantifiers are real prenominal words (この / すべての …) that render in a sentence; their の is
  // part of the value, so they need no extra particle. The `no` quantifier is a circumfix — its
  // prenominal どの leads here, its も closes the group with its case particle (see `jaParticleSegs`),
  // and its clause-final ない is the predicate's job (see predicateSegs / mannerGlossSegs).
  const definiteness = (np.head.forms['definiteness'] ?? 'definite') as Definiteness;
  const prenominalDet = JA_PRENOMINAL_DET[definiteness];
  if (prenominalDet) core.push({ t: prenominalDet });
  else if (definiteness === 'no') core.push({ t: JA_NEGATIVE_DETERMINER.pre });
  // A possessor is prenominal, marked by の ("猫の本"); recursing handles its own
  // adjectives / nested possessor / relative clause ("子供の猫の本"). A pronominal possessor
  // ("彼の犬") is the antecedent pronoun + の, invariant of the possessed head.
  if (np.possessor) {
    core.push(
      ...(isPronominalPossessor(np.possessor)
        ? possessiveJa(np.possessor)
        // A `no` possessor keeps its も before the の (a separate, unhandled case: どの猫もの本).
        : [...npSegs(np.possessor), ...(np.possessor.head.forms['definiteness'] === 'no' ? [{ t: JA_NEGATIVE_DETERMINER.post }] : []), { t: 'の' }]),
    );
  }
  // Attributive nouns ("sail boat") are also の-linked in Japanese (ガラスのコップ); the
  // relation is neutralised, so every relation renders the same の. The modifier's own
  // adjectives are bare (Japanese adjectives don't agree) and precede it (意味的なフレーズ
  // の創造者 = "semantic phrase creator").
  for (const m of np.nounModifiers) {
    const base = m.concept.forms['base'];
    if (!base) continue;
    for (const a of m.adjectives) {
      const ab = a.forms['base'] ?? '';
      if (ab) core.push(wordSeg(ab, a.forms['reading']));
    }
    core.push(wordSeg(base, m.concept.forms['reading']), { t: 'の' });
  }
  const adjSegs: RubySegment[] = [];
  for (const a of np.adjectives) {
    // The lowered degrees negate the adjective (大きい → 大きくない); every other keeps the base.
    const { base, reading } = jaComparisonAdj(a);
    if (!base) continue;
    // Prenominal degree adverb bound directly to its adjective (もっと大きい), no space.
    const deg = JA_DEGREE[adjDegree(a)];
    if (deg) adjSegs.push({ t: deg });
    adjSegs.push(wordSeg(base, reading));
  }
  core.push(...adjSegs);
  const head = np.head.forms;
  core.push(wordSeg(head['base'] ?? '', head['reading']));
  // A relative clause is prenominal in Japanese: the whole predicate precedes the head
  // noun with no relative pronoun (泣いた少年 = "the boy who cried"). For a non-subject
  // (e.g. object) relative the clause's own subject leads, marked by が (私が読む本 = "the
  // book I read"); the gap slot is already absent from the clause. The clause verb takes
  // the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました of a main
  // clause — Japanese requires plain form on a prenominal predicate (see plainVerbSeg), so the
  // predicate is built with `plain` set.
  const rel = np.relative;
  if (!rel) return core;
  // A generic ("one") subject is dropped, leaving the bare prenominal clause (食べる物 "a thing one
  // eats"); a specific non-subject relative leads with its own subject marked by が (私が読む本).
  const clauseSubjectSegs: RubySegment[] =
    rel.headRole !== 'subject' && rel.subject && !isGenericSubject(rel.subject)
      ? [...elSegs(rel.subject), ...jaParticleSegs(rel.subject, 'が')] : [];
  const relSubjNeg = rel.headRole !== 'subject' && rel.subject ? isNegativeGroup(rel.subject) : false;
  // The clause's subject is the head itself for a subject relative, else its own subject.
  const relAnimate = isAnimate(rel.headRole !== 'subject' && rel.subject ? rel.subject.conjuncts : [np]);
  // A head that fills the copula's subject complement leaves a gap Japanese cannot leave empty: the
  // pro-form そう takes its place, with the plain copula a relative takes (犬がそうではない伝説, 犬がそう
  // である猫), rather than the existential a copula with no complement would be (A123).
  const complements = rel.headRole === 'predicative' && rel.verbPhrase.verb.forms['copula'] === '1'
    ? { ...rel.complements, predicative: JA_SOU }
    : rel.complements;
  return [...clauseSubjectSegs, ...predicateSegs(rel.verbPhrase, rel.directObject, complements, undefined, true, relSubjNeg, relAnimate), ...core];
}
