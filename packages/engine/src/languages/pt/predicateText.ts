import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { negatorLead } from '../../functions/negatorLead.js';
import { agreeingAdverb } from '../../functions/agreeingAdverb.js';
import { moreAdverbsOf, moreAdverbText } from '../../functions/adverbClass.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { modalChain } from '../../functions/modalChain.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { ESTAR_COPULA, FOCUS_WORDS, HAVER_EXISTENTIAL } from './pt.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeAdj } from './agreeAdj.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';
import { ptCliticize } from './ptCliticize.js';
import { ptEnclitic } from './ptEnclitic.js';
import { ptNegateInfinitive } from './ptNegateInfinitive.js';
import { reflexiveClitic } from './reflexiveClitic.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';
import { withRelative } from './withRelative.js';

/**
 * The predicate half of a phrase — everything after the subject noun. Shared by the
 * top-level sentence and by relative clauses, which pass the head noun's forms as
 * `subjectForms` so the verb agrees with the head.
 */
export function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  // Set when nothing is rendered ahead of the predicate: a main clause whose pronoun subject was
  // dropped (see `renderClause`). A 3rd-person clitic cannot open the clause, so it follows the verb.
  verbLeads = false,
  // The demoted agent of a passive clause, rendered as the "por" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a preverbal `no` phrase ("nenhum gato"), which already negates
  // the clause. The caller's, as in English and German (see `negationSources`): a subject relative is
  // handed its head's forms for agreement, but a `no` head negates the MATRIX clause, not the relative
  // one (A167). It defaults to the forms' own `no`, which is right wherever they are the subject's.
  subjectIsNegative = subjectForms['definiteness'] === 'no',
  // The complement slot a relative clause's head fills, for a clause that IS a relative (see
  // `relativeGapType`). A gap is not in `complements` — the relativizer renders it — so the copula
  // choice below would otherwise see a clause that predicates nothing: "o slot onde o cursor **é**"
  // for "está" (A199).
  gapComplement?: ComplementType,
): string {
  const { verb: givenVerb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // An existential conjugates "haver" for the HAVE it was resolved with (P09-E6 D5, see
  // `HAVER_EXISTENTIAL`): every form below reads it, so the tense, the negation and the modals compose
  // on it as on any verb.
  const verb = verbPhrase.existential ? HAVER_EXISTENTIAL : givenVerb;
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correria")
  // or imperfect-subjunctive (protasis, "comesse") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  // With a plural noun object the impersonal se is the passive se, and the finite verb agrees with its
  // patient, as Italian's si and Spanish's se do (A73): "um lugar onde se fazem frases", "os ratos que
  // se comem" (A206). A clitic object keeps se impersonal, and so does the object of a verb that takes
  // it with a preposition ("se clica nos botões", A139). Only the agreement: the main clause keeps the
  // proclitic it already had ("se comem os ratos"), where the standard writes *comem-se*.
  const passiveSe = subjectForms['generic'] === '1' && !!directObject && !objectPreposition(verb)
    && !isPronounElement(directObject) && directObject.agreement['number'] === 'plural';
  const agreeForms = passiveSe ? { ...subjectForms, number: 'plural' } : subjectForms;
  const pn = moodPN(agreeForms);
  // A state verb's past is the imperfect ("queria", "tinha", "estava"), not the perfective (A130).
  // A pronominal verb's stored forms carry a fixed clitic ("me tornarei", "se tornaram"), so both are
  // derived from the plain verb and take the subject's clitic in front: "se tornaria", "me tornasse" (A137).
  const moodFinite = (m: ConceptForms): string | undefined => {
    const plain = nonReflexiveVerb(m);
    const form = moodForm('pt', plain, pn, mood) ?? statePastForm('pt', plain, pn, tense, mood);
    const clitic = reflexiveClitic(m.forms, agreeForms);
    return form && clitic ? `${clitic} ${form}` : form;
  };
  const finite = (m: ConceptForms) => moodFinite(m) ?? conjugate(m.forms, agreeForms, tense);
  // A47: Portuguese splits the copula. `estar` covers two BE frames; `ser` everything else.
  //  · Location — "o gato está na casa", never "*é na casa". A place is `estar` unconditionally,
  //    whatever the spatial relation, so a locative alone selects it; the past inherits the choice
  //    as the pretérito ("esteve"). But a locative alongside a predicate nominal ("é uma lenda na
  //    casa") is a mere adjunct — the predicative decides the copula there — so estar fires for a
  //    locative only when it is the sole predication.
  //  · A transient predicate adjective — "está cansado", not "*é cansado". Inherent adjectives
  //    ("é grande") and predicate nouns ("é uma lenda") keep `ser`; the corpus marks which
  //    adjectives are transient (`forms['transient']`), read off the first conjunct.
  //  · An elided subject complement (A121) picks the copula it would pick if spoken, so a clause keeps
  //    its antecedent's, and says nothing in its place: "está feliz, mas o cão não está".
  const { elided } = verbPhrase;
  const predicative = complements?.predicative ?? (elided?.type === 'predicative' ? elided.complement : undefined);
  const locative = complements?.locative ?? (elided?.type === 'locative' ? elided.complement : undefined);
  const predicativeHead = predicative ? firstConjunct(predicative.phrase).head.forms : undefined;
  const transientPredicative =
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1'
    // A superlative is headed by its article, a noun phrase with the noun understood, and that
    // identifies the subject as a predicate noun does: "o gato é o mais feliz" (A284).
    && predicativeHead['degree'] !== 'most' && predicativeHead['degree'] !== 'least';
  // A relativised place is the gap, not a complement, and it predicates just as a spoken one does:
  // "a casa onde o gato está arde" (A199). So does an adverb of place, which says where as a
  // locative does: "o gato está aqui", "está em toda parte", never "*é aqui" (localization B67),
  // and one among several: "o gato está frequentemente aqui" (P15).
  const locativeAlone = (!!locative || gapComplement === 'locative' || isPlaceAdverb(modifier)
    || moreAdverbsOf(verbPhrase, 'place').length > 0) && !predicative;
  // Every form of the verb below reads the choice, not only the finite one: "deve estar", "tinha
  // estado", "esteja", "estar na casa".
  // The passive conjugates "ser" where the active conjugates the lexical verb, and agrees that
  // verb's particípio with the promoted patient — now this clause's subject ("a comida é comida",
  // "as comidas são comidas"). `copulaVerb` is what every branch below builds its group out of, so
  // the composition follows: "foi comida", "está sendo comida", "deve ser comida", "seria comida".
  // The estar/ser split above is the copula's own and has nothing to say here: a passive of a
  // lexical verb is always "ser".
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const copulaVerb = passive ? verbPhrase.passiveAux!
    : verb.conceptId === 'BE' && (locativeAlone || transientPredicative) ? ESTAR_COPULA : verb;
  const passiveParticipleText = passive
    ? agreeAdj(passiveParticiple(verb), subjectForms['gender'] ?? 'masc', isPlural(subjectForms))
    : '';
  // A modal chain makes the outermost modal the finite verb ("quero poder ir"); the clause's own
  // "não" is prepended below and lands in front of it, exactly as for a plain verb. Every element
  // the chain governs is denied where it stands instead, by a bare preverbal "não" of its own:
  // "devo não ir" is a positive DEVER over a negated IR (the prohibition), and "não devo ir" denies
  // the obligation. An inner modal takes the same word ("devo não poder ir").
  // TOGETHER is an adverb in every language, but the Portuguese word for it is a predicative
  // adjective and agrees with the subject — "as gatas comem juntas", not the flat "*juntos" (A162).
  // Such a lexeme carries its agreeing stem beside the citation form; a true adverb has none and
  // emits `base` unchanged. Every adverb in the verb group is read through here, so a modal's own
  // agrees too; where that one is *placed* is `modalChain`'s business and is not changed here.
  const adverbSurface = (a?: ConceptForms): string => {
    if (!a) return '';
    const stem = agreeingAdverb(a);
    return stem
      ? agreeAdj(stem, subjectForms['gender'] ?? 'masc', isPlural(subjectForms))
      : (a.forms['base'] ?? '');
  };
  // Under a negation a modal governs, the adverb is in the governed group behind its "não", and takes
  // its negative word there without moving: "pode não comer ainda" (P09-E28 follow-up).
  const governedOnly = verbNegative !== true && governedNegative === true && modals.length > 0;
  const governedWord = governedOnly ? negativeAdverb(modifier, true) : undefined;
  const adverbText = governedWord && modifier?.forms['negative'] ? governedWord.text : adverbSurface(modifier);
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142). An adverb of
  // place (EM TODA PARTE) leaves the manner slot too, but stands among the complements where a
  // locative does, not at their head (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // A verb's further adverbs (P15). A frequency one follows the primary, a frequency adverb too, in
  // the slot after the verb ("corre já frequentemente"), and keeps that slot where the primary stands
  // in front ("ainda não comeu frequentemente"). A manner one follows them there, ahead of a noun
  // object, where a manner primary stands ("come frequentemente rapidamente o rato"), so it trails a
  // prospective's whole group, as a manner primary does. A direction or place one stands among the
  // complements.
  const moreFrequency = moreAdverbText(verbPhrase, 'frequency', adverbSurface);
  const moreManner = moreAdverbText(verbPhrase, 'manner', adverbSurface);
  // Portuguese fronts one negative frequency adverb ("nunca") preverbally without "não", whichever
  // verb it modifies. Scan the group outermost-first (each modal, then the main verb); the first
  // negative adverb takes that slot. `frontIdx` indexes this array: 0…n-1 modals, n = main verb.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  // The main verb's own adverb is not among the candidates when a modal governs it: it denies
  // that governed group, and fronting it would put the "nunca" on the modal instead (A236).
  const frontable = modals.length > 0 ? groupAdverbs.slice(0, -1) : groupAdverbs;
  const frontIdx = verbNegative ? -1 : frontable.findIndex((a) => a?.forms['polarity'] === 'negative');
  const preVerbNunca = frontIdx >= 0;
  // The main verb's own negation, which only a modal can govern: "quero não ir". It leads the
  // governed infinitive group — before the aspect auxiliary and its enclitic ("devo não ter
  // comido", "quero não mover-me") — inside the chain, where the finite "não" never reaches. With
  // no modal the main verb IS the finite one, and `verbNegative` already carries it.
  // A negative adverb on the main verb denies the group the modal governs, not the modal: "quer não
  // comer nunca" — the cat wants to never eat — not "nunca quer comer" (A236).
  // An adverb that is its own "não" with a word in front ("já não") leads the negator it would
  // otherwise repeat, and is not said after the verb: "pode já não correr", "já não correr", "já não
  // corra" (`negatorLead`, localization B84).
  const lead = negatorLead(modifier);
  const governedNao = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0
    ? [lead, 'não'].filter(Boolean).join(' ') : '';
  const conjugated = modals.length > 0
    ? [
        // Each modal's adverb trails its verb ("não quer nunca poder ir"), except the fronted
        // negative adverb, which takes the preverbal slot instead (emitted as preVerb). An inner
        // modal's own "não" leads it ("devo não poder ir").
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: adverbSurface(m.modifier) }), 'não'),
        governedNao,
        verbGroupInfinitive(copulaVerb.forms, agreeForms, aspect),
      ].filter(Boolean).join(' ')
    : aspect === 'neutral'
      ? finite(copulaVerb)
      : aspectVerb(copulaVerb.forms, agreeForms, tense, aspect, mood);
  // A frequency adverb on the prospective belongs right after the finite "estar", not after the whole
  // periphrasis, where it would scope over the infinitive alone — "está prestes a comer SEMPRE" reads as
  // *is about to always eat* (A147). A fronted "nunca" is already preverbal, and a manner adverb does
  // trail the group ("está prestes a comer bem"). The progressive is idiomatic either way and is left alone.
  const mainIsFronted = frontIdx === modals.length;
  const splitFrequency = !mainIsFronted && !!modifierText && modifier?.forms['subtype'] === 'frequency'
    && aspect === 'prospective' && modals.length === 0;
  // The particípio closes the verb group, behind whatever auxiliaries the tense/aspect/modals built.
  const grouped = [splitFrequency
    ? [conjugated.split(' ')[0], modifierText, moreFrequency, ...conjugated.split(' ').slice(1)].filter(Boolean).join(' ')
    : conjugated, passiveParticipleText].filter(Boolean).join(' ');
  // A "nenhum" (no) direct object is post-verbal, so it triggers negative concord —
  // "não vê nenhum menino" — whereas a pre-verbal "nenhum" subject does not.
  // Any "nenhum" conjunct triggers the concord — "não vê nenhum menino e nenhuma menina" — and so does
  // a "nenhum" possessor, in the object or in a complement: "não vê a casa de nenhum homem" (A216).
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false;
  const complementIsNegative = hasNegativeComplement(complements) || hasNegativePossessorComplement(complements);
  // A negator inside the governed group is preverbal for everything that follows it, so a "nenhum"
  // object or complement concords with that one instead: "quer não comer nenhuma comida" takes no
  // second "não" on the modal, which would deny the modal as well (see `negationSources.governed`).
  const concordedInside = governedNao !== '' || modals.some((m) => m.negative);
  // The preverbal "não" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("nenhum gato …") or a preverbal "nunca" (the finite adverb)
  // already negates the clause, so "não" is dropped.
  const needsNao = verbNegative || ((objectIsNegative || complementIsNegative) && !concordedInside)
    || finiteHasNegativeAdverb(verbPhrase);
  const verbText = needsNao && !subjectIsNegative && !preVerbNunca ? `não ${grouped}` : grouped;
  // A pronoun direct object is a proclitic before the finite verb — the Brazilian order "o gato me
  // vê", after "não" in the negative ("não me vê") — not a post-verbal noun ("vê o eu"). A noun
  // object keeps the post-verbal slot.
  // A verb that takes its object with a preposition ("clica no botão", A139) has no direct object for a
  // clitic to stand in for: its pronoun takes the tonic form after the preposition ("clica em mim", "nele").
  const objectPrep = objectPreposition(verb);
  const objectClitic = directObject && !objectPrep && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes the
  // normative tonic object, "a" + its tonic form ("vê a ele e a mim", "vê o cão e a você").
  // The personal "a" marks a person, so the indefinite pronoun that stands for a **thing** takes
  // none: "come algo", never "*come a algo" (C32). Nor does the one for a person: Portuguese keeps
  // its "a" for the tonic personal pronoun, and says "vê alguém", "não vê ninguém" (P09-E40), where
  // Spanish says "ve a alguien".
  const tonicOrNoun = (np: ResolvedNounPhrase) => objectPrep ? prepObjectText(np, objectPrep)
    : np.head.forms['person']
      // An indefinite pronoun keeps its relative clause: "vê alguém que corre" (A309).
      ? withRelative(`${np.head.forms['thing'] === '1' || np.head.forms['indefinite'] === '1' ? '' : 'a '}${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np)
      : npText(np);
  // The impersonal "se" is a preverbal clitic standing in for a generic subject ("se come" — "one
  // eats"); the subject word is suppressed upstream. It leads any object clitic ("se o come").
  //
  // A reflexive verb already carries its own "se" in the form ("se move"), and the impersonal one
  // cannot stand beside it — "*se se move" is no sentence. The generic subject is then spelled out
  // as a word instead, written back into the subject slot the clause emptied: "a gente se move"
  // (A152). With a subject in front, a 3rd-person object clitic no longer opens the clause either.
  const isGeneric = subjectForms['generic'] === '1';
  const genericSubject = isGeneric && reflexiveClitic(copulaVerb.forms, subjectForms)
    ? (subjectForms['generic_reflexive'] ?? '') : '';
  const impersonalClitic = isGeneric && !genericSubject ? (subjectForms['base'] ?? '') : '';
  const proclitics = [impersonalClitic, objectClitic].filter(Boolean).join(' ');
  // A 3rd-person o / a / os / as cannot open a clause in either norm, so wherever nothing precedes
  // the verb it follows it, hyphenated (`ptEnclitic`): an affirmative command ("veja-o"), an
  // instruction or infinitive ("vê-lo"), and a clause whose subject was dropped ("vejo-o"). Me / te /
  // nos lead a clause colloquially and stay in front ("me veja").
  const thirdPersonClitic = !!objectClitic && firstConjunct(directObject!).head.forms['person'] === '3' ? objectClitic : '';
  // A passive has no direct object left — the patient is this clause's subject now — so the slot
  // after the verb carries the by-phrase instead ("é comida pelo gato na casa").
  const directObjectText = passive ? agentPhrase(agent)
    // A focus particle singles the object out, from outside the phrase: "come só a comida" (C39).
    : directObject && !objectClitic
      ? withFocus(coordinateElement(directObject, tonicOrNoun), slotFocus(directObject), FOCUS_WORDS) : '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  // A focus adverb that scopes over the negation stands in front of the "não" it outscopes:
  // "também não come a comida", not "não come também a comida" (A245).
  const negAdverb = negativeAdverb(modifier, verbText.startsWith('não '));
  const outscopesNao = negAdverb?.slot === 'pre-negator';
  // Its negative word where it has one: ALREADY's "já" is "ainda não" (P09-E28).
  const preVerb = preVerbNunca ? adverbSurface(groupAdverbs[frontIdx]) : outscopesNao ? (modifier?.forms['negative'] && verbNegative === true ? negAdverb.text : modifierText) : '';
  const postVerb = [
    mainIsFronted || splitFrequency || outscopesNao || (!!lead && governedNao !== '') ? '' : modifierText,
    splitFrequency ? '' : moreFrequency,
    moreManner,
  ].filter(Boolean).join(' ');
  const complementsText = complementsAroundAdverb(modifier, adverbText, complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement),
    { direction: moreAdverbText(verbPhrase, 'direction', adverbSurface), place: moreAdverbText(verbPhrase, 'place', adverbSurface) });
  // Imperative: a subjectless command. The person picks the form (tu = 3sg-present, nós / every
  // negative = present subjunctive, vós = 2pl-present − s); a negative command ("não comas")
  // prefixes "não". The adverb simply trails the verb here.
  if (mood === 'imperative') {
    // A "nenhum" complement is post-verbal, and obliges the negator here as in the statement:
    // "não corra em nenhuma casa" (A208).
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative;
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Portuguese ("Carregar um período", "Não correr"), not the imperative.
    // A pronominal command is derived from the plain verb and takes the addressee's reflexive — "se"
    // for você / vocês, "nos" for nós — after an affirmative command ("torne-se", "tornemo-nos", the
    // -s dropping) and before a negative one ("não se torne"). The instruction keeps "tornar-se", and
    // under "não" draws its "se" ahead as the infinitive below does: "não se tornar" (A233).
    const impPN = moodPN(subjectForms);
    const reflexive = register !== 'instruction' && (copulaVerb.forms['base'] ?? '').endsWith('-se')
      ? (impPN === '1pl' ? 'nos' : 'se') : '';
    const impForm = register === 'instruction'
      ? (copulaVerb.forms['base'] ?? conjugated)
      : (imperativeForm('pt', nonReflexiveVerb(copulaVerb), impPN, impNeg) ?? conjugated);
    const negated = reflexive
      ? (impNeg ? `não ${reflexive} ${impForm}` : `${reflexive === 'nos' ? impForm.replace(/s$/, '') : impForm}-${reflexive}`)
      : !impNeg && thirdPersonClitic
        ? ptEnclitic(impForm, thirdPersonClitic)
        : ptCliticize(objectClitic, impNeg ? ptNegateInfinitive(impForm) : impForm);
    const impVerb = impNeg && lead ? `${lead} ${negated}` : negated;
    return [impVerb, lead ? '' : modifierText, moreFrequency, moreManner, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir o alimento"), the same surface
  // Portuguese already gives the imperative `instruction` register above. Negation prefixes "não"
  // ("não consumir"); a 3rd-person object pronoun attaches after it ("consumi-lo"), and after "não"
  // it leads ("não o consumir"), as a reflexive verb's own "se" does ("não se mover", A233).
  if (mood === 'infinitive') {
    // A passive citation is the infinitive of "ser" plus the particípio ("ser comida").
    const inf = [copulaVerb.forms['base'] ?? conjugated, passiveParticipleText].filter(Boolean).join(' ');
    const infNeg = verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative;
    const negated = !infNeg && thirdPersonClitic
      ? ptEnclitic(inf, thirdPersonClitic)
      : ptCliticize(objectClitic, infNeg ? ptNegateInfinitive(inf) : inf);
    const infVerb = infNeg && lead ? `${lead} ${negated}` : negated;
    return [infVerb, infNeg && lead ? '' : modifierText, moreFrequency, moreManner, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // With nothing ahead of the verb, the clitic follows the last verb of the group that can carry it:
  // the finite verb ("vejo-o", "tinha-o visto") or a modal's infinitive ("posso vê-lo"), never a
  // participle. A synthetic future or conditional would split for it ("vê-lo-ei"); that mesoclisis
  // is not modelled, so those keep the clitic in front.
  const verbFirst = verbLeads && !preVerb && !impersonalClitic && !genericSubject && !verbText.startsWith('não ')
    && (modals.length > 0 || aspect !== 'neutral' || (tense !== 'future' && mood !== 'conditional'));
  const participle = copulaVerb.forms['participle'];
  const verbWords = verbText.split(' ');
  const host = verbWords.map((w, i) => (w !== participle ? i : -1)).filter((i) => i >= 0).pop() ?? verbWords.length - 1;
  const cliticizedVerb = verbFirst && thirdPersonClitic
    ? verbWords.map((w, i) => (i === host ? ptEnclitic(w, thirdPersonClitic) : w)).join(' ')
    : ptCliticize(proclitics, verbText);
  return [genericSubject, preVerb, cliticizedVerb, postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
