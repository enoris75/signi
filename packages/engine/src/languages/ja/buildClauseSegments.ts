import type { ResolvedPhrase, ResolvedVerbPhrase, RubySegment } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { foldModalGovernor } from '../../functions/foldModalGovernor.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { complementGlossSegs } from './complementGlossSegs.js';
import { contentClauseLink } from './contentClauseLink.js';
import { dimensionGlossSegs } from './dimensionGlossSegs.js';
import { elSegs } from './elSegs.js';
import { isAnimate } from './isAnimate.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { isPossessiveExistential } from './isPossessiveExistential.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { JA_NEGATIVE_DETERMINER, JA_PURPOSE, JA_SURU } from './ja.consts.js';
import { isPotentialPassive } from './isPotentialPassive.js';
import { jaCausativeVerb } from './jaCausativeVerb.js';
import { jaAgentParticle } from './jaAgentParticle.js';
import { jaImperativePN } from './jaImperativePN.js';
import { jaParticleSegs } from './jaParticleSegs.js';
import { mannerGlossSegs } from './mannerGlossSegs.js';
import { predicateSegs } from './predicateSegs.js';
import { questionAdverb } from './questionAdverb.js';
import { questionNoun } from './questionNoun.js';
import { relativeClauseSegs } from './relativeClauseSegs.js';
import { shapeAdverbialClause } from './shapeAdverbialClause.js';

/**
 * Japanese word order: S 〈complements, recipient に〉 DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
export function buildClauseSegments(given: ResolvedPhrase, subjectParticle: string, plain: boolean | 'quote' = false): RubySegment[] {
  // A modal governing an infinitive is the modal chain over it, suffixed to the verb: 行動したい, never
  // 行動することをたい (A222, see `foldModalGovernor`).
  const phrase = foldModalGovernor(given);
  // A verbless period marked as an adjective-definition gloss is a が-predicate ("大きさが大きい"),
  // not a bare noun-phrase title — render the dimension noun + が + its degree adjective.
  if (!phrase.verbPhrase && isDimensionGloss(phrase.subject)) return dimensionGlossSegs(firstConjunct(phrase.subject));
  // A complement-definition gloss (すべての場所で, より高い場所へ) is the place or direction complement
  // that defines an adverb, as a clause renders it.
  if (!phrase.verbPhrase && isComplementGloss(phrase.subject)) return complementGlossSegs(phrase.subject);
  // A manner-definition gloss ("高い速さで") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(phrase.subject)) return mannerGlossSegs(phrase.subject);
  // A relative-clause gloss (保存した) is the head's prenominal clause alone, in the plain form it
  // takes before a head.
  if (!phrase.verbPhrase && isRelativeGloss(phrase.subject)) return relativeClauseSegs(firstConjunct(phrase.subject));
  // Verbless period: a bare noun phrase (a title like "最新ニュース") — no topic は, no predicate. A
  // `no` group still closes its どの … も circumfix on ない, which no predicate is there to supply
  // ("どの保存済みのフレーズもない", "no saved phrases"), as the manner gloss does.
  if (!phrase.verbPhrase) {
    return isNegativeGroup(phrase.subject)
      ? [...elSegs(phrase.subject), { t: JA_NEGATIVE_DETERMINER.post }, { t: 'ない' }]
      : elSegs(phrase.subject);
  }
  const segs: RubySegment[] = [];
  // A wh-question moves nothing in Japanese: its word is the noun (or the adverb) its slot would hold,
  // with the slot's own particle, and か closes the clause as it closes a yes/no one (P09-E6).
  const asked = phrase.question;
  const copula = phrase.verbPhrase.verb.forms['copula'] === '1';
  const askedNoun = asked ? questionNoun(asked, copula) : undefined;
  const askedSlot = asked?.role === 'locative' ? 'locative' : asked?.role === 'manner' ? 'predicative' : undefined;
  // An imperative drops its subject/topic; the subject's person still selects the form. An
  // infinitive citation (「食物を消費する」) is likewise subject-less on the surface.
  const imperative = phrase.verbPhrase.mood === 'imperative';
  const dropsSubject = imperative || phrase.verbPhrase.mood === 'infinitive';
  // One topic particle for the whole subject, coordinated or not: 「ピーターとパウロは」.
  const subjectNegative = isNegativeGroup(phrase.subject);
  const animate = isAnimate(phrase.subject.conjuncts);
  // The owner in an existential possession is where the thing is, so an "if" clause marks it with に,
  // not が (もし家に壁があったら, A150). The topic は stays (家は壁があります).
  // A subject a possessor question asks inside is new information too, and takes が where a subject
  // gap does: 誰の猫が食べ物を食べますか (P09-E14).
  const particle = asked?.role === 'possessor' && asked.possessed !== 'directObject' ? 'が'
    : subjectParticle === 'が' && isPossessiveExistential(phrase.verbPhrase.verb, animate) ? 'に' : subjectParticle;
  // A `no` subject's も replaces the topic/subject particle (どの時間も, not どの時間もは).
  // A content clause standing where the subject would really is the subject in Japanese: it is
  // nominalized with こと and marked が, in the slot the noun phrase would have filled — 行動すること
  // が正しい. No expletive, and no extraposition: the six European languages move the clause behind
  // the predicate because they cannot leave it in front, and Japanese can (C30).
  if (phrase.contentSubject) {
    // Nominalized, so the clause inside it is plain (行動する, not 行動します) — and a generic subject
    // is unsaid there, as it is in every citation: 行動することが正しい, not 人は行動することが正しい.
    segs.push(...buildClauseSegments(phrase.contentSubject, 'が', true), { t: 'ことが' });
  } else if (asked?.role === 'subject' && askedNoun) {
    // A subject wh-question is never the topic: a question word is new information, which は cannot
    // mark, so it takes が — 誰が食べ物を食べますか (P09-E6).
    segs.push(...elSegs(askedNoun), { t: 'が' });
  } else if (phrase.verbPhrase.existential) {
    // An existential speaks no subject: the impersonal one it was resolved with is the six European
    // languages' expletive, and what exists is the pivot, marked が in the object's slot, right ahead of
    // the verb and behind any place — 家に猫がいます (P09-E6 D5, see `predicateSegs`).
  } else if (!dropsSubject && !(plain && phrase.subject.agreement['generic'] === '1')) {
    segs.push(...elSegs(phrase.subject), ...jaParticleSegs(phrase.subject, particle));
  }
  // The demoted agent of a passive takes に, right after the topic and before everything else the
  // predicate holds: 食べ物は猫に食べられます ("the food is eaten by the cat"). The agentless passive has
  // none — the translator drops a generic agent rather than passing it (see ResolvedPhrase.agent).
  //
  // Where the clause already spends its に on something else — the dative recipient of a
  // ditransitive, or the factitive object complement — the agent takes the compound によって
  // instead, because two に in one clause cannot be told apart: 本は猫によって子供にあげられます, never
  // 「猫に子供に」.
  if (phrase.agent) segs.push(...elSegs(phrase.agent), ...jaParticleSegs(phrase.agent, jaAgentParticle(phrase.complements)));
  // An adverbial clause stands ahead of the predicate it modifies, behind the topic: plain, its
  // subject marked が, closed by its postposed conjunction — 男性は猫が食べる時に走ります (P09-E4).
  if (phrase.adverbialClause) {
    const adverbial = shapeAdverbialClause(phrase.adverbialClause);
    segs.push(...buildClauseSegments(adverbial.clause, 'が', true), { t: adverbial.word });
  }
  // A clause of purpose precedes what it is done for, closed by ために on the dictionary form:
  // 「変更するためにクリック」, 「翻訳を見るために主語を選択」. It is a citation clause, so it speaks no
  // subject of its own — the one it shares with this clause is already the topic above.
  if (phrase.purpose) segs.push(...buildClauseSegments(phrase.purpose, subjectParticle), { t: JA_PURPOSE });
  // An infinitive complement is a nominalized clause ahead of the predicate governing it, closed by
  // the tail the governor's lexeme names (`infinitive_link`, ことを by default): 行動することが可能です,
  // 食べ物を食べることを望みます, and ように for the causative below. The clause is itself a citation, in
  // the dictionary form, and may govern one in turn (行動することが可能であることを望む). Negated, it
  // takes the citation's plain negative (行動しないことが可能である, B13).
  // Under object control the controller is the one that acts, so Japanese speaks it *inside* the
  // clause with が (人が物体を見るようにする) instead of leaving it in the matrix object slot.
  const causee = phrase.infinitiveComplement?.control === 'object' ? phrase.directObject : undefined;
  // A governor whose Japanese is the causative **suffix** (`causative_suffix`: LET, whose 〜させる is
  // what Japanese says where the six European languages say a verb, C36) has no clause to nominalize
  // and no verb of its own. The causee takes を when what it is made to do is intransitive and に
  // when that verb has an object of its own — 犬を走らせる, 犬に食べ物を食べさせる — and what closes the
  // clause is the governed verb in its causative form, built below.
  const suffixCausative = !!causee && phrase.verbPhrase?.verb.forms['causative_suffix'] === '1'
    && !!phrase.infinitiveComplement?.verbPhrase;
  if (suffixCausative && causee) {
    segs.push(...elSegs(causee), ...jaParticleSegs(causee, phrase.infinitiveComplement?.directObject ? 'に' : 'を'));
  } else if (phrase.infinitiveComplement) {
    if (causee) segs.push(...elSegs(causee), ...jaParticleSegs(causee, 'が'));
    segs.push(...buildClauseSegments(phrase.infinitiveComplement, subjectParticle), { t: infinitiveLink(phrase) || 'ことを' });
  }
  // An object clause stands where the object would, right ahead of the verb: plain, its subject
  // marked が, and closed by the verb's と or ことを — 猫が走ると言います, 猫が走ることを知っています (P09-E4).
  // A quoted clause closes on the terminal form, which only a copula tells apart (幸せであると).
  if (phrase.contentObject) {
    const link = contentClauseLink(phrase);
    segs.push(...buildClauseSegments(phrase.contentObject, 'が', link === 'と' ? 'quote' : true), { t: link });
  }
  const impPN = imperative ? jaImperativePN(phrase.subject.agreement) : undefined;
  // Japanese has no transitive verb "to cause" that governs a clause: the causative is the ようにする
  // construction, and its light verb する is what closes the predicate. The lexeme's own word
  // (引き起こす, what the verb says standing alone) would not take a ように clause, so the construction
  // supplies する in its place — the substitution the existential already makes for the copula.
  // An agentless passive under the potential 〜ことができる keeps its **active** verb: the potential
  // already demotes the agent and leaves the patient as the topic, so the 〜れる/られる would mark the
  // same thing a second time (フレーズは保存することができません, not 保存されることができません).
  // See `isPotentialPassive`; `predicateSegs` reads `voice` to decide, so the flag is what gives way.
  const voiced: ResolvedVerbPhrase = isPotentialPassive(phrase)
    ? { ...phrase.verbPhrase, voice: 'active' }
    : phrase.verbPhrase;
  // The suffix causative replaces this clause's verb with the governed verb's causative form; the
  // ようにする causative replaces it with する, which is what closes that construction.
  const governed = phrase.infinitiveComplement?.verbPhrase;
  const verbPhrase = suffixCausative && governed
    ? { ...voiced, verb: jaCausativeVerb(governed.verb), aspect: 'neutral' as const }
    : causee && voiced.verb.forms['causative'] === '1'
      ? { ...voiced, verb: JA_SURU }
      : voiced;
  // A `no` causee is still this clause's object, and negates this clause, not the one it is spoken in
  // (A171): 猫はどの犬も食べるようにしません, "the cat causes no dog to eat". The clause keeps its own polarity.
  const causeeNegative = !!causee && isNegativeGroup(causee);
  // The manner and the cause question words stand where an adverb would, ahead of the predicate.
  segs.push(...questionAdverb(asked, copula));
  segs.push(...predicateSegs(
    // Under the suffix causative the governed verb's own object is this clause's, since the two
    // clauses have collapsed into one: 犬に食べ物を食べさせます.
    verbPhrase,
    suffixCausative ? phrase.infinitiveComplement?.directObject : causee ? undefined
      : phrase.directObject ?? (asked?.role === 'directObject' ? askedNoun : undefined),
    // A nominalized clause is plain, as a prenominal one is (行動する, not 行動します).
    askedSlot && askedNoun ? { ...phrase.complements, [askedSlot]: { phrase: askedNoun } } : phrase.complements,
    impPN, plain,
    subjectNegative || causeeNegative, animate,
  ));
  return segs;
}
