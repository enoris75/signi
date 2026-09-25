import type { ComplementType, Tense } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase, RubySegment } from '../../types.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import type { JaForm, JaIPN } from './ja.types.js';
import { JA_ARU, JA_IRU, JA_SOU } from './ja.consts.js';
import { aspectFormSegs } from './aspectFormSegs.js';
import { aspectVerbSegs } from './aspectVerbSegs.js';
import { complementSegs } from './complementSegs.js';
import { copulaSegs } from './copulaSegs.js';
import { copularContinuation } from './copularContinuation.js';
import { slotSegs } from './slotSegs.js';
import { isAnimate } from './isAnimate.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { isPossessiveExistential } from './isPossessiveExistential.js';
import { jaImperativeSegs } from './jaImperativeSegs.js';
import { jaModifierSeg } from './jaModifierSeg.js';
import { jaPassiveVerb } from './jaPassiveVerb.js';
import type { JaRespect } from './jaRespectRegister.js';
import { jaRespectVerb } from './jaRespectVerb.js';
import { modalSegs } from './modalSegs.js';
import { plainVerbSeg } from './plainVerbSeg.js';
import { splitObjectPredicative } from './splitObjectPredicative.js';
import { taraSeg } from './taraSeg.js';
import { verbSeg } from './verbSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The predicate half of a phrase, in Japanese order: complements (the recipient's に among
 * them) DirectObj+を Adv V. Shared by the main sentence (after 〜は) and by prenominal
 * relative clauses.
 * `imperativePN` is set only for a top-level command (relative clauses are never imperative).
 * `plain` is set only for a subordinate (prenominal relative) predicate: its finite verb takes
 * the plain form instead of the polite ます (see plainVerbSeg), and so does its aspect (see
 * aspectVerbSegs). `'quote'` is the plain form a clause takes before the quotative と (P09-E4), which
 * differs only where a copula closes it: the terminal 幸せである, not the attributive 幸せな a head noun
 * would follow (猫が幸せであると言います). `'question'` is the plain form before an indirect question's
 * か / かどうか (P09-E17), which takes the terminal である where a na-adjective would write its
 * attributive な (猫が幸せであるかどうか, A278) and is otherwise the prenominal form (幸せだったかどうか).
 * `'content'` is a nominalized content clause, before こと (猫が幸せなことを): prenominal, as `true` is.
 * The three content values say that the clause reports something, where `true` (a relative clause, an
 * adverbial one) does not, so only they give a state verb its 〜ている (A279: 猫が本を持っていると).
 * `'reach'` is an adverbial clause closed by まで or 前に, which name a state reached: a copula predicate
 * says it as the change of state 〜になる (犬が幸せになるまで, A323), and is otherwise prenominal.
 * `'held'` is an adverbial clause closed by ので, 時に or のに, which report it as holding: prenominal, as
 * `true` is, but a state verb takes its 〜ている as in a content clause (犬が本を持っているので, A347).
 */
export type JaPlain = boolean | 'quote' | 'question' | 'content' | 'reach' | 'held';

export function predicateSegs(
  plannedVerbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounElement | undefined,
  plannedComplements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  imperativePN?: JaIPN,
  plain: JaPlain = false,
  subjectNegative = false,
  // Whether the subject is animate (a person or an animal); picks いる over ある for a located subject.
  animateSubject = false,
  // Whether the thing possessed is animate, for a possessive existential whose object is not in the
  // clause: a relative clause on the thing possessed (家にいる猫), where the head fills the gap. Read
  // off `directObject` when omitted.
  animateObject?: boolean,
  // The register of respect the subject calls for (P11-E1, see `jaRespectRegister`), decided by the
  // clause, which alone knows whose the subject is. Only a polite main predicate passes one.
  respect?: JaRespect,
  // The word a relative clause says for the relation its gap's particle carried (A290: 一緒に,
  // 相手にして, see `relativeClauseSegs`). It stands where the particle's phrase would: ahead of a
  // manner adverb (一緒に速く走る), behind a frequency one (いつも一緒に走る).
  gapRelation: RubySegment[] = [],
): RubySegment[] {
  // 続ける over a copular complement compounds on the copula's stem, the predicate before it in its
  // connective form — 幸せであり続けます, 大きくあり続けます (A315, see `copularContinuation`). The
  // predicate is then no complement of the clause but the head of its verb group, said right before
  // the verb, behind any adverb (`continuation.segs` below).
  const continuedPredicative = plannedVerbPhrase.verb.forms['copular_compound'] === '1' ? plannedComplements?.['predicative'] : undefined;
  const continuation = continuedPredicative ? copularContinuation(plannedVerbPhrase.verb, continuedPredicative) : undefined;
  const givenVerbPhrase = continuation ? { ...plannedVerbPhrase, verb: continuation.verb } : plannedVerbPhrase;
  const complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined = continuation
    ? (({ predicative: _, ...rest }) => (Object.keys(rest).length ? rest : undefined))(plannedComplements!)
    : plannedComplements;
  // The subject complement of the copula. An elided one is spoken as the pro-form そう (A121: 犬は
  // そうではありません); an elided locative has no pro-form, and leaves the existential below (犬はいません).
  // A verb Japanese says as an **adjective** (localization C34): 好き is a な-adjective, not a verb,
  // and the thing liked is what it is said of — 猫は犬が好きです. The lexeme flags itself `adjectival`
  // and marks its object が (`object_particle`); everything else follows from the copula path below,
  // so tense, negation, the たら form, a relative clause and a modal all compose on it exactly as
  // they do on any predicate adjective (犬が好きな猫, 犬が好きではありませんでした).
  const adjectival = givenVerbPhrase.verb.forms['adjectival'] === '1';
  const predicative = (adjectival
    ? {
        phrase: {
          conjuncts: [{
            head: { ...givenVerbPhrase.verb, forms: { ...givenVerbPhrase.verb.forms, role: 'adjective' } },
            adjectives: [],
            nounModifiers: [],
          }],
          agreement: {},
        },
      } satisfies ResolvedComplement
    : undefined)
    ?? complements?.['predicative']
    ?? (givenVerbPhrase.elided?.type === 'predicative' ? JA_SOU : undefined);
  // BE with no predicative states that the subject exists, or where it is: Japanese uses the
  // existential verb, いる for an animate subject and ある for an inanimate one, and marks any place
  // with に (猫はいます, 猫は家にいます, 本は家にあります). The existential is a real verb, so the plain,
  // modal, command and たら paths below compose on it. Being somewhere is a state, so a periphrastic
  // aspect has nothing to add, except the resultative, which reads as the past (家にいました).
  const copulaExistential = givenVerbPhrase.verb.forms['copula'] === '1' && !predicative;
  // HAVE with an inanimate owner is the same existential, its object marked が in place of を: 壁がある場所
  // "a place that has walls", 家は窓があります (A150). ある is a state verb, so it takes no 〜ている either.
  const possessive = !copulaExistential && isPossessiveExistential(givenVerbPhrase.verb, animateSubject);
  const existential = copulaExistential || possessive;
  // Every other object takes を, unless its verb governs it with another particle, which its lexeme
  // names as `object_particle`: 続く takes its object with に, as one follows *after* a thing (猫は犬に
  // 続きます). Read off the verb as given, like `locative_particle` below.
  // The pivot of an existential clause ("there is a cat") is what exists, in the object's slot: it is
  // marked が as the thing possessed is, and it picks いる / ある as a located subject does — 猫がいます,
  // 家に本があります (P09-E6 D5).
  const pivot = copulaExistential && givenVerbPhrase.existential === true;
  const objectParticle = possessive || pivot ? 'が' : (givenVerbPhrase.verb.forms['object_particle'] ?? 'を');
  // A passive is not a branch of the predicate but a different verb in the same slot: the 〜れる/られる
  // form standing where the active one stood (see `jaPassiveVerb`), which then conjugates for tense,
  // negation, aspect and the modal suffixes like any other ichidan verb. The existential substitution
  // above wins where both could apply — an existential clause has no agent to demote.
  // The existential verb follows what exists: the subject under BE (猫は家にいます), the thing possessed
  // under HAVE, whose owner is inanimate by definition (家は猫がいます, 家は壁があります; A217).
  const animateExistent = pivot
    ? directObject !== undefined && isAnimate(directObject.conjuncts)
    : possessive
    ? animateObject ?? (directObject !== undefined && isAnimate(directObject.conjuncts))
    : animateSubject;
  const substituted: ResolvedVerbPhrase = existential
    ? {
        ...givenVerbPhrase,
        verb: animateExistent ? JA_IRU : JA_ARU,
        aspect: 'neutral',
        tense: givenVerbPhrase.aspect === 'resultative' ? 'past' : givenVerbPhrase.tense,
      }
    : givenVerbPhrase.voice === 'passive'
      ? { ...givenVerbPhrase, verb: jaPassiveVerb(givenVerbPhrase.verb) }
      : givenVerbPhrase;
  // Someone else's relative is spoken of with the honorific word and one's own side, when asked, with
  // the humble one — いらっしゃいます, 召し上がります, 参ります (P11-E1). It is the verb actually said that
  // changes, so the existential いる takes it too (お母さんは家にいらっしゃいます); a verb with no word
  // of its own for the register keeps its plain one.
  const respected: ResolvedVerbPhrase = respect
    ? { ...substituted, verb: jaRespectVerb(substituted.verb, respect) }
    : substituted;
  // An adverb with a negative word of its own says it under the negation (`negativeAdverb`), and
  // one whose lexeme names `negative_aspect: 'resultative'` puts the denied verb in the resultant
  // 〜ている: ALREADY's もう is まだ食べていません "has not eaten yet", where the plain まだ食べません is
  // "won't eat yet" and もう食べていません "no longer" (P09-E28 D2). Only a plain verb takes it — an
  // existential or a copula has no 〜ている to give, a modal governs its own form.
  // A negation a modal governs denies the main verb, which the adverb modifies: まだ食べないことが
  // できます (P09-E28 follow-up). The 〜ている stays a plain verb's (below).
  const negAdverb = negativeAdverb(respected.modifier,
    respected.negative === true || (respected.governedNegative === true && respected.modals.length > 0));
  const { reading: _reading, ...unread } = respected.modifier?.forms ?? {};
  const yetForms = negAdverb && respected.modifier?.forms['negative']
    ? { ...respected.modifier, forms: { ...unread, base: negAdverb.text } }
    : respected.modifier;
  const resultativeNegative = !!negAdverb && respected.modifier?.forms['negative_aspect'] === 'resultative'
    && !existential && respected.verb.forms['copula'] !== '1' && !adjectival
    && (respected.aspect ?? 'neutral') === 'neutral' && respected.modals.length === 0;
  const verbPhrase: ResolvedVerbPhrase = {
    ...respected,
    modifier: yetForms,
    ...(resultativeNegative ? { aspect: 'resultative' as const } : {}),
  };
  const { verb, negative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // The object complement follows the object it predicates of, where every other complement
  // precedes it (see `splitObjectPredicative`).
  const { objectPredicative, rest: splitComplements } = splitObjectPredicative(complements);
  // A verb that marks its opponent with the particle its object already takes falls back to the
  // generic を相手に beside that object (A373): WIN says 犬に勝ちます and ゲームに勝ちます, but both
  // together are 犬を相手にゲームに勝ちます, never two に phrases.
  const opponent = splitComplements?.opponent;
  const adjunctComplements = directObject && opponent?.link && opponent.link === objectParticle
    ? { ...splitComplements, opponent: { ...opponent, link: undefined } }
    : splitComplements;
  // Whether the predicate is the copula's — the real copula with a complement, or a verb that is an
  // adjective in Japanese (see `adjectival` above). Both close the clause on です rather than on a
  // conjugated verb.
  const copulaPredicate = (verbPhrase.verb.forms['copula'] === '1' || adjectival) && !!predicative;
  // The particle this verb's place takes (see `complementSegs`). The existential states where the
  // subject is, に (家にいます); so do the lexemes that seed `locative_particle` — 住む names where one
  // lives and 閉じ込める where the confined thing ends up, neither of them a place an act merely goes
  // on in (家に住みます, 犬を家に閉じ込めます; A190). Everything else keeps the default で, so it passes
  // nothing. Read off `verbPhrase.verb`, the verb actually rendered, so a passive carries it too.
  const locativeParticle = existential ? 'に' : verbPhrase.verb.forms['locative_particle'];
  // The verb's adverb, which an adverb of place says with the same particle (ここにいます, ここで食べます;
  // see `jaModifierSeg`).
  const adverb = jaModifierSeg(modifier, locativeParticle);
  const frequency = modifier?.forms['subtype'] === 'frequency';
  const segs: RubySegment[] = [];
  // A negative-polarity adverb (決して "never", めったに "rarely") grammatically demands a
  // negated predicate — 決して…ない — so it forces the predicate negative even when the verb
  // phrase itself isn't marked negative. The adverb is still emitted; only the ending flips.
  // A negative-polarity adverb anywhere in the group — the main verb's or any modal's — forces
  // the negated predicate (決して…ない). A `no`-determiner argument (subject, object, or complement)
  // is likewise a negative-concord trigger: its も needs the clause-final ない to complete the
  // circumfix (どの時間も食べない), mirroring how Italian's `non` fires off hasNegativeComplement.
  // A similative comparison is the one place the two part company: Romance leaves the clause
  // positive under "like no dog" (A181), where Japanese writes the same circumfix as everywhere else
  // (どの犬のようにも) and so still needs its ない — hence `countComparisons`.
  const concord = subjectNegative
    || (directObject !== undefined && isNegativeGroup(directObject))
    || hasNegativeComplement(complements, { countComparisons: true })
    // A `no` possessor in a complement closes the same circumfix around its phrase (どの男の家でも; A216).
    || hasNegativePossessorComplement(complements, { countComparisons: true });
  // Where a modal denies the group it governs, that inner ない is the one a `no` argument concords
  // with, and the finite modal takes none — 猫はどの食べ物も食べないでいたいです, not 食べないでいたくない
  // です, which would deny the wanting too (A03). A negative adverb still goes to the finite element
  // by design (see `groupHasNegativeAdverb`).
  // A negative adverb on the main verb negates the governed verb, not the modal: 決して食べないでい
  // たいです — the cat wants to never eat — where the finite reading is 決して食べたくないです (A236).
  const governedNeg = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0;
  // Any ない the chain already stands inside the predicate closes the circumfix: the governed group's,
  // or an inner modal's own (どの食べ物も食べることができない必要があります). The translator has moved the
  // outermost modal's flag to `negative`, so `modals` only ever carries the inner ones' — the same
  // reading `negationSources.governed` gives the languages that write a separate negator.
  const innerNegation = governedNeg || modals.some((m) => m.negative === true);
  const negated = negative === true || finiteHasNegativeAdverb(verbPhrase) || (concord && !innerNegation);
  // The copula (BE) has no verb of its own — the predicate carries the inflected です. It is
  // intransitive, so no object occurs; its adjuncts (locative, cause) and an adverb (いつも)
  // precede the predicate, as they precede an ordinary verb.
  // Imperative: a subjectless command (SOV — objects/complements first, verb last). The copula
  // command is built on なる, "be / become X": 伝説になってください, 大きくなりましょう. する would be
  // causative ("make it X"). なる's nai-form is fixed, so the 2nd-person negative stays polite
  // (伝説にならないでください) rather than the plain prohibitive ordinary verbs take.
  if (mood === 'imperative') {
    const pn = imperativePN ?? '2sg';
    if (copulaPredicate) {
      const naru = pn === '1pl'
        ? (negated ? 'なるのはやめましょう' : 'なりましょう')
        : (negated ? 'ならないでください' : 'なってください');
      // The pro-form そう is adverbial and takes no に: そうなってください.
      segs.push(...(predicative === JA_SOU ? [{ t: 'そう' }] : complementSegs({ predicative })), { t: naru });
      return segs;
    }
    segs.push(...complementSegs(adjunctComplements, locativeParticle));
    if (directObject) segs.push(...slotSegs(directObject, objectParticle));
    segs.push(...complementSegs(objectPredicative));
    if (adverb) segs.push(adverb);
    if (continuation) segs.push(...continuation.segs);
    segs.push(...jaImperativeSegs(verb, pn, negated, register === 'instruction'));
    return segs;
  }
  // Infinitive / citation phrase: the plain dictionary form (SOV, subject-less) — 「食物を消費する」.
  // This is the true citation, distinct from the imperative `instruction` register above, which
  // Japanese renders as the verbal noun (消費). A copula predicate falls through to the です block,
  // which closes a citation in the plain written style (可能である). A negative citation takes the plain
  // negative (食べない。, 食べないために, 行動しないことを; B13).
  if (mood === 'infinitive' && !copulaPredicate) {
    segs.push(...complementSegs(adjunctComplements, locativeParticle));
    if (directObject) segs.push(...slotSegs(directObject, objectParticle));
    segs.push(...complementSegs(objectPredicative));
    // A citation carries modals only as the chain a modal-headed clause folds into (A222, see
    // `foldModalGovernor`), and the chain closes it in the plain form, each modal's adverb ahead of the
    // main verb's: 行動したい, 物体を持つことができる, 行動したくない, 行動しない必要がある.
    for (const m of modals) {
      const b = m.modifier?.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, m.modifier!.forms['reading']));
    }
    if (adverb) segs.push(adverb);
    if (continuation) segs.push(...continuation.segs);
    segs.push(...(modals.length > 0
      ? modalSegs(modals, verb, 'present', negated, 0, undefined, 'plain', undefined, undefined, governedNeg)
      : [plainVerbSeg(verb, 'present', negated)]));
    return segs;
  }
  if (copulaPredicate) {
    // The predicate noun closes the clause, so every other complement is preposed ahead of it
    // (猫は家で犬のために伝説です) rather than lost behind です.
    const { predicative: _, ...adjuncts } = complements ?? {};
    segs.push(...complementSegs(adjuncts));
    // An adjectival verb still has its object, which its particle marks — 猫は犬が好きです. The real
    // copula is intransitive and never has one.
    if (directObject) segs.push(...slotSegs(directObject, objectParticle));
    for (const m of modals) {
      const b = m.modifier?.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, m.modifier!.forms['reading']));
    }
    if (!frequency) segs.push(...gapRelation);
    if (modifier) {
      const base = modifier.forms['base'] ?? '';
      if (base) segs.push(wordSeg(base, modifier.forms['reading']));
    }
    if (frequency) segs.push(...gapRelation);
    // A modal suffixes the predicate in the form it governs, and takes the tense, polarity and ending
    // itself, as over a verb (A128): 幸せである必要があります, 伝説でありたいです, 伝説である必要がある猫.
    // A polarity of the predicate's own goes on the predicate, in that same governed form (A03:
    // 幸せでない必要があります).
    if (modals.length > 0) {
      const ending = mood === 'subjunctive' ? 'tara' : plain || mood === 'infinitive' ? 'plain' : 'polite';
      // Under 〜かもしれない the predicate itself is finite, in the plain written style a citation takes
      // (幸せではないかもしれません, 伝説であったかもしれません; see `modalSegs`).
      segs.push(...modalSegs(modals, verb, tense, negated, 0, undefined, ending,
        (form, neg) => copulaSegs(predicative, 'present', neg, form),
        (t, n) => copulaSegs(predicative, t, n, 'citation'), governedNeg));
      return segs;
    }
    // A copula has no verb to carry aspect; the only meaningful one is the resultative
    // ("has been X"), a past state — rendered as the past copula (美しくなかった). Progressive /
    // prospective on a copula stay best-effort present. (Aspect on a copula is marginal.)
    const copTense = tense === 'past' || aspect === 'resultative' ? 'past' : tense;
    // An "if" clause takes the たら form (幸せだったら), a relative clause the prenominal one (幸せな猫), and
    // a citation the plain one (「行動することが可能である」 "to be able to act"), and an indirect
    // question the closing one (幸せであるかどうか, A278), and まで / 前に the change of state (幸せになるまで, A323).
    const form = mood === 'subjunctive' ? 'tara' : mood === 'infinitive' || plain === 'quote' ? 'citation'
      : plain === 'question' ? 'closing' : plain === 'reach' ? 'reach' : plain ? 'prenominal' : 'polite';
    segs.push(...copulaSegs(predicative, copTense, negated, form));
    return segs;
  }
  segs.push(...complementSegs(adjunctComplements, locativeParticle));
  if (directObject) segs.push(...slotSegs(directObject, objectParticle));
  segs.push(...complementSegs(objectPredicative));
  // Adverbs precede the predicate (SOV). Each modal's adverb stacks in scope order (outermost
  // first), with the main verb's adverb nearest the verb — 決して いつも 行きたくない.
  for (const m of modals) {
    const b = m.modifier?.forms['base'] ?? '';
    if (b) segs.push(wordSeg(b, m.modifier!.forms['reading']));
  }
  if (!frequency) segs.push(...gapRelation);
  if (adverb) segs.push(adverb);
  if (frequency) segs.push(...gapRelation);
  if (continuation) segs.push(...continuation.segs);
  // Hypothetical conditional: the "if" clause (subjunctive) takes the ～たら form on whatever closes
  // its verb group — the verb (食べたら, 食べなかったら), the outermost modal (食べることができたら) or the
  // aspect (食べていたら). The main clause (conditional) falls through to the ordinary polite
  // main-clause path — Japanese has no dedicated conditional inflection, and keeping the normal path
  // preserves tense and, crucially, negation (走りません). The たら protasis carries the hypothetical.
  const tara = mood === 'subjunctive';
  // A132: a state verb (持つ, 所有する, 愛する, 知る) says in a finite clause that the state holds with the
  // resultant 〜ている, as the progressive is built: 持っています, 持っていました, 持っていたら. Its plain
  // 〜ます names the change of state ("picks up"). Two lexemes keep the plain form: a Japanese state verb
  // (`state_verb`: 思える, like ある), and a state whose negative is the event's (`event_negative`: 知りません).
  // A content clause reports the state as the main clause does, in the plain 〜ている (A279: 猫が本を
  // 持っていると言います, 持っているかどうか, 持っていることを), and so does an adverbial clause under ので,
  // 時に or のに (A347: 持っているので). A relative clause, an adverbial clause under 前に, 後で or まで
  // (the event: 持つ前に) and the dictionary form a modal governs keep the plain verb (本を持つ猫).
  const reported = plain === 'quote' || plain === 'question' || plain === 'content' || plain === 'held';
  const heldState = aspect === 'neutral' && (!plain || reported) && verb.forms['stative'] === '1' && verb.forms['state_verb'] !== '1'
    && !(negated && verb.forms['event_negative'] === '1');
  // A modal suffixes the verb and takes the tense and the finite polarity itself; the polarity of what
  // it governs goes on the governed group as its ない form (A03: 行かない必要があります, 行かないでい
  // たいです). An aspect stands under it in the form the modal governs (B07): 食べている必要があります,
  // 食べていたいです, 食べようとしている必要があります.
  if (modals.length > 0) {
    const governed = aspect === 'neutral' ? undefined : (form: JaForm, neg: boolean) => aspectFormSegs(verb, aspect, form, neg);
    // Under 〜かもしれない the aspect is finite, in its plain form: 食べているかもしれません, and the perfect
    // 食べたかもしれません "might have eaten" (see `modalSegs`).
    const finite = aspect === 'neutral' ? undefined
      : (t: Tense, n: boolean) => aspectVerbSegs({ ...verbPhrase, tense: t }, n, 'plain');
    segs.push(...modalSegs(modals, verb, tense, negated, 0, undefined, tara ? 'tara' : plain ? 'plain' : 'polite', governed, finite, governedNeg));
  }
  else if (heldState) segs.push(...aspectVerbSegs({ ...verbPhrase, aspect: 'progressive' }, negated, tara ? 'tara' : plain ? 'plain' : 'polite'));
  else if (tara && aspect === 'neutral') segs.push(taraSeg(verb, negated));
  // A prenominal relative clause takes the plain form on its finite verb (食べる猫 / 食べた猫), in the
  // negative too (食べない猫 / 食べなかった猫, 決して食べない猫; B13).
  else if (aspect === 'neutral') {
    segs.push(plain ? plainVerbSeg(verb, tense, negated) : verbSeg(verb, negated, tense));
  }
  // An aspect takes the same three endings (B14): 食べています, 食べていたら, and before a head noun 食べている猫.
  // The perfect of a counterfactual main clause, "would have run", is the past resultant state 走っていました
  // (もし猫が食べていたら、犬は走っていました), whatever its tense (B05).
  else {
    const aspectPhrase = mood === 'conditional' && aspect === 'resultative' ? { ...verbPhrase, tense: 'past' as const } : verbPhrase;
    segs.push(...aspectVerbSegs(aspectPhrase, negated, tara ? 'tara' : plain ? 'plain' : 'polite'));
  }
  return segs;
}
