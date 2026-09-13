import type { ComplementType } from '@signi/shared';
import { groupHasNegativeAdverb, hasNegativeComplement, type ResolvedComplement, type ResolvedNounElement, type ResolvedVerbPhrase, type RubySegment } from '../../types.js';
import type { JaIPN } from './ja.types.js';
import { JA_ARU, JA_IRU } from './ja.consts.js';
import { aspectVerbSegs } from './aspectVerbSegs.js';
import { complementSegs } from './complementSegs.js';
import { copulaSegs } from './copulaSegs.js';
import { elSegs } from './elSegs.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaImperativeSegs } from './jaImperativeSegs.js';
import { modalSegs } from './modalSegs.js';
import { plainVerbSeg } from './plainVerbSeg.js';
import { taraSeg } from './taraSeg.js';
import { verbSeg } from './verbSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The predicate half of a phrase, in Japanese order: complements (the recipient's に among
 * them) DirectObj+を Adv V. Shared by the main sentence (after 〜は) and by prenominal
 * relative clauses.
 * `imperativePN` is set only for a top-level command (relative clauses are never imperative).
 * `plain` is set only for a subordinate (prenominal relative) predicate: its finite verb takes
 * the plain form instead of the polite ます (see plainVerbSeg).
 */
export function predicateSegs(
  givenVerbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounElement | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  imperativePN?: JaIPN,
  plain = false,
  subjectNegative = false,
  // Whether the subject is animate (a person or an animal); picks いる over ある for a located subject.
  animateSubject = false,
): RubySegment[] {
  // BE with a locative and no predicative states where the subject is: Japanese uses the existential
  // verb, いる for an animate subject and ある for an inanimate one, and marks the place with に
  // (猫は家にいます, 本は家にあります). The existential is a real verb, so the plain, modal, command
  // and たら paths below compose on it. Being somewhere is a state, so a periphrastic aspect has
  // nothing to add, except the resultative, which reads as the past (家にいました).
  const existential = givenVerbPhrase.verb.forms['copula'] === '1' && !complements?.['predicative'] && !!complements?.['locative'];
  const verbPhrase: ResolvedVerbPhrase = existential
    ? {
        ...givenVerbPhrase,
        verb: animateSubject ? JA_IRU : JA_ARU,
        aspect: 'neutral',
        tense: givenVerbPhrase.aspect === 'resultative' ? 'past' : givenVerbPhrase.tense,
      }
    : givenVerbPhrase;
  const { verb, negative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  const segs: RubySegment[] = [];
  // A negative-polarity adverb (決して "never", めったに "rarely") grammatically demands a
  // negated predicate — 決して…ない — so it forces the predicate negative even when the verb
  // phrase itself isn't marked negative. The adverb is still emitted; only the ending flips.
  // A negative-polarity adverb anywhere in the group — the main verb's or any modal's — forces
  // the negated predicate (決して…ない). A `no`-determiner argument (subject, object, or complement)
  // is likewise a negative-concord trigger: its も needs the clause-final ない to complete the
  // circumfix (どの時間も食べない), mirroring how Italian's `non` fires off hasNegativeComplement.
  const negated = negative === true || groupHasNegativeAdverb(verbPhrase)
    || subjectNegative
    || (directObject !== undefined && isNegativeGroup(directObject))
    || hasNegativeComplement(complements);
  // The copula (BE) has no verb of its own — the predicate carries the inflected です. It is
  // intransitive, so no object occurs; its adjuncts (locative, cause) and an adverb (いつも)
  // precede the predicate, as they precede an ordinary verb.
  const predicative = complements?.['predicative'];
  // Imperative: a subjectless command (SOV — objects/complements first, verb last). The copula
  // command is built on なる, "be / become X": 伝説になってください, 大きくなりましょう. する would be
  // causative ("make it X"). なる's nai-form is fixed, so the 2nd-person negative stays polite
  // (伝説にならないでください) rather than the plain prohibitive ordinary verbs take.
  if (mood === 'imperative') {
    const pn = imperativePN ?? '2sg';
    if (verb.forms['copula'] === '1' && predicative) {
      const naru = pn === '1pl'
        ? (negated ? 'なるのはやめましょう' : 'なりましょう')
        : (negated ? 'ならないでください' : 'なってください');
      segs.push(...complementSegs({ predicative }), { t: naru });
      return segs;
    }
    segs.push(...complementSegs(complements, existential));
    if (directObject) segs.push(...elSegs(directObject), ...(isNegativeGroup(directObject) ? [] : [{ t: 'を' }]));
    if (modifier) {
      const b = modifier.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, modifier.forms['reading']));
    }
    segs.push(...jaImperativeSegs(verb, pn, negated, register === 'instruction'));
    return segs;
  }
  // Infinitive / citation phrase: the plain dictionary form (SOV, subject-less) — 「食物を消費する」.
  // This is the true citation, distinct from the imperative `instruction` register above, which
  // Japanese renders as the verbal noun (消費). A copula predicate falls through to the です block
  // (a copula citation won't arise for a verb definition). The plain negative needs a nai-form the
  // lexicon doesn't store, so a negative citation falls back to the polite verbSeg — a documented gap.
  if (mood === 'infinitive' && !(verb.forms['copula'] === '1' && predicative)) {
    segs.push(...complementSegs(complements, existential));
    if (directObject) segs.push(...elSegs(directObject), ...(isNegativeGroup(directObject) ? [] : [{ t: 'を' }]));
    if (modifier) {
      const b = modifier.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, modifier.forms['reading']));
    }
    segs.push(negated ? verbSeg(verb, true, 'present') : plainVerbSeg(verb, 'present'));
    return segs;
  }
  if (verb.forms['copula'] === '1' && predicative) {
    // The predicate noun closes the clause, so every other complement is preposed ahead of it
    // (猫は家で犬のために伝説です) rather than lost behind です.
    const { predicative: _, ...adjuncts } = complements ?? {};
    segs.push(...complementSegs(adjuncts));
    if (modifier) {
      const base = modifier.forms['base'] ?? '';
      if (base) segs.push(wordSeg(base, modifier.forms['reading']));
    }
    // A copula has no verb to carry aspect; the only meaningful one is the resultative
    // ("has been X"), a past state — rendered as the past copula (美しくなかった). Progressive /
    // prospective on a copula stay best-effort present. (Aspect on a copula is marginal.)
    const copTense = tense === 'past' || aspect === 'resultative' ? 'past' : tense;
    segs.push(...copulaSegs(predicative, copTense, negated));
    return segs;
  }
  segs.push(...complementSegs(complements, existential));
  if (directObject) segs.push(...elSegs(directObject), ...(isNegativeGroup(directObject) ? [] : [{ t: 'を' }]));
  // Adverbs precede the predicate (SOV). Each modal's adverb stacks in scope order (outermost
  // first), with the main verb's adverb nearest the verb — 決して いつも 行きたくない.
  for (const m of modals) {
    const b = m.modifier?.forms['base'] ?? '';
    if (b) segs.push(wordSeg(b, m.modifier!.forms['reading']));
  }
  if (modifier) {
    const base = modifier.forms['base'] ?? '';
    if (base) segs.push(wordSeg(base, modifier.forms['reading']));
  }
  // Hypothetical conditional: the "if" clause (subjunctive) takes the ～たら form. The main
  // clause (conditional) falls through to the ordinary polite main-clause path — Japanese has
  // no dedicated conditional inflection, and keeping the normal path preserves tense and,
  // crucially, negation (走りません). The たら protasis carries the hypothetical meaning.
  if (mood === 'subjunctive') segs.push(taraSeg(verb));
  // A modal suffixes the verb and takes the tense/polarity itself; aspect has no
  // periphrasis to compose with here, so it is dropped (see the Modality note on `modalSegs`).
  else if (modals.length > 0) segs.push(...modalSegs(modals.map((m) => m.verb), verb, tense, negated));
  // A prenominal relative clause takes the plain form on its finite verb (食べる猫 / 食べた猫).
  // Negation still routes through the polite verbSeg — the plain negative (ない/なかった) needs a
  // nai-form the lexicon doesn't store — a documented remaining gap.
  else if (aspect === 'neutral') {
    segs.push(plain && !negated ? plainVerbSeg(verb, tense) : verbSeg(verb, negated, tense));
  }
  else segs.push(...aspectVerbSegs(verbPhrase, negated));
  return segs;
}
