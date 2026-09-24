import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { agreeingAdverb } from '../../functions/agreeingAdverb.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { groupObjectClitic } from '../../functions/groupObjectClitic.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import type { InvertedSubject } from '../../functions/experiencerInverts.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { modalChain } from '../../functions/modalChain.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { dativePronounForm } from '../../functions/dativePronounForm.js';
import { recipientPronoun, withoutTerminus } from '../../functions/recipientPronoun.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { ESTAR_COPULA, FOCUS_WORDS, HABER_EXISTENTIAL } from './es.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeAdj } from './agreeAdj.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { coordinateElement } from './coordinateElement.js';
import { esCliticCluster } from './esCliticCluster.js';
import { esCliticize } from './esCliticize.js';
import { esEnclitic } from './esEnclitic.js';
import { isPlural } from './isPlural.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { objectNounText } from './objectNounText.js';
import { prepObjectText } from './prepObjectText.js';
import { reflexiveClitic } from './reflexiveClitic.js';
import { takesPersonalA } from './takesPersonalA.js';
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
  // The demoted agent of a passive clause, rendered as the "por" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a preverbal `no` phrase ("ningún gato"), which already negates
  // the clause. The caller's, as in English and German (see `negationSources`): a subject relative is
  // handed its head's forms for agreement, but a `no` head negates the MATRIX clause, not the relative
  // one (A167). It defaults to the forms' own `no`, which is right wherever they are the subject's.
  subjectIsNegative = subjectForms['definiteness'] === 'no',
  // The complement slot a relative clause's head fills, for a clause that IS a relative (see
  // `relativeGapType`). A gap is not in `complements` — the relativizer renders it — so the copula
  // choice below would otherwise see a clause that predicates nothing: "el slot donde el cursor
  // **es**" for "está" (A199).
  gapComplement?: ComplementType,
  // The subject an experiencer clause says after the verb, where an object would stand, and whether
  // its dative was fronted, which leaves only the clitic here: "al gato le gusta **el perro** en la
  // casa" (A369, see `experiencerInverts`).
  invertedSubject?: InvertedSubject,
  frontedDative = false,
): string {
  const { verb: givenVerb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // An existential conjugates "haber" for the HAVE it was resolved with (P09-E6 D5, see
  // `HABER_EXISTENTIAL`): every form below reads it, so the tense, the negation and the modals compose
  // on it as on any verb.
  const verb = verbPhrase.existential ? HABER_EXISTENTIAL : givenVerb;
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correría")
  // or imperfect-subjunctive (protasis, "comiera") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  // With a plural noun object the impersonal se is the passive se, and the finite verb agrees with its
  // patient: "se comen los ratones", "se han comido los ratones". A clitic object keeps se impersonal,
  // and so does an object marked with the personal "a", a pronoun or a human: "se ve a los niños".
  // A verb that takes its object with a preposition ("clica en el botón", A139) has no direct object to
  // be a clitic or the passive se's patient: "se clica en los botones", "clica en mí".
  const objectPrep = objectPreposition(verb);
  const passiveSe = subjectForms['generic'] === '1' && !!directObject && !objectPrep && !isPronounElement(directObject)
    && directObject.agreement['number'] === 'plural'
    && !directObject.conjuncts.some((np) => np.head.forms['person'] || takesPersonalA(np, verb.forms));
  const agreeForms = passiveSe ? { ...subjectForms, number: 'plural' } : subjectForms;
  const pn = moodPN(agreeForms);
  // A reflexive verb's stored forms carry a fixed clitic ("me volveré", "se volvieron"), so its mood
  // form is derived from the plain verb and takes the subject's clitic in front: "se volvería", "me
  // volviera".
  // A state verb's past is the imperfect ("quería", "tenía", "estaba"), not the perfective (A130), and is
  // derived the same way.
  const moodFinite = (m: ConceptForms): string | undefined => {
    const plain = nonReflexiveVerb(m);
    const form = moodForm('es', plain, pn, mood) ?? statePastForm('es', plain, pn, tense, mood);
    const clitic = reflexiveClitic(m.forms, agreeForms);
    return form && clitic ? `${clitic} ${form}` : form;
  };
  const finite = (m: ConceptForms) => moodFinite(m) ?? conjugate(m.forms, agreeForms, tense);
  // A47: Spanish splits the copula. `estar` covers two BE frames; `ser` everything else.
  //  · Location — "el gato está en la casa", never "*es en la casa". A place is `estar`
  //    unconditionally, whatever the spatial relation, so a locative alone selects it; the past
  //    inherits the choice as the preterite ("estuvo"). But a locative alongside a predicate
  //    nominal ("es una leyenda en la casa") is a mere adjunct — the predicative decides the copula
  //    there — so estar fires for a locative only when it is the sole predication.
  //  · A transient predicate adjective — "está cansado", not "*es cansado". Inherent adjectives
  //    ("es grande") and predicate nouns ("es una leyenda") keep `ser`; the corpus marks which
  //    adjectives are transient (`forms['transient']`), read off the first conjunct.
  //  · An elided subject complement (A121) picks the copula it would pick if spoken, so a clause keeps
  //    its antecedent's: "está feliz, pero el perro no lo está", "está en la casa, pero el perro no está".
  const { elided } = verbPhrase;
  const predicative = complements?.predicative ?? (elided?.type === 'predicative' ? elided.complement : undefined);
  const locative = complements?.locative ?? (elided?.type === 'locative' ? elided.complement : undefined);
  const predicativeHead = predicative ? firstConjunct(predicative.phrase).head.forms : undefined;
  const transientPredicative =
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1'
    // A superlative is headed by its article, a noun phrase with the noun understood, and that
    // identifies the subject as a predicate noun does: "el gato es el más feliz" (A284).
    && predicativeHead['degree'] !== 'most' && predicativeHead['degree'] !== 'least';
  // A relativised place is the gap, not a complement, and it predicates just as a spoken one does:
  // "la casa donde el gato está arde" (A199). So does an adverb of place, which says where as a
  // locative does: "el gato está aquí", "está en todas partes", never "*es aquí" (localization B67).
  const locativeAlone = (!!locative || gapComplement === 'locative' || isPlaceAdverb(modifier)) && !predicative;
  // Every form of the verb below reads the choice, not only the finite one: "debe estar", "ha
  // estado", "no estés", "estar en la casa".
  // The passive conjugates "ser" where the active conjugates the lexical verb, and agrees that
  // verb's participio with the promoted patient — now this clause's subject ("la comida es comida",
  // "las comidas son comidas"). `copulaVerb` is what every branch below builds its group out of, so
  // the composition follows: "ha sido comida", "está siendo comida", "debe ser comida", "sería
  // comida". The estar/ser split above is the copula's own and has nothing to say here: a passive of
  // a lexical verb is always "ser".
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const copulaVerb = passive ? verbPhrase.passiveAux!
    : verb.conceptId === 'BE' && (locativeAlone || transientPredicative) ? ESTAR_COPULA : verb;
  const passiveParticipleText = passive
    ? agreeAdj(passiveParticiple(verb), subjectForms['gender'] ?? 'masc', isPlural(subjectForms))
    : '';
  // A modal chain makes the outermost modal the finite verb ("quiero poder ir"); the clause's own
  // "no" is prepended below and lands in front of it, exactly as for a plain verb. Every element
  // the chain governs is denied where it stands instead, by a bare preverbal "no" of its own:
  // "debo no ir" is a positive DEBER over a negated IR (the prohibition), and "no debo ir" denies
  // the obligation. An inner modal takes the same word ("debo no poder ir").
  // TOGETHER is an adverb in every language, but the Spanish word for it is a predicative
  // adjective and agrees with the subject — "las gatas comen juntas", not the flat "*juntos" (A162).
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
  // A focus adverb that scopes over the negation takes its negative-polarity word, and Spanish puts
  // that word preverbally, where it carries the negation itself and the clause's "no" gives way to
  // it — the concord *nunca* already has: "el gato tampoco come la comida" (A245).
  // Under a negation a modal governs, the adverb is in the governed group behind its "no", and takes
  // its negative word there without moving: "puede no comer todavía", "puede no comer tampoco"
  // (P09-E28 follow-up). Its slot is the finite negation's.
  const governedOnly = verbNegative !== true && governedNegative === true && modals.length > 0;
  const negFound = negativeAdverb(modifier, verbNegative === true || governedOnly);
  const negAdverb = negFound && governedOnly ? { text: negFound.text } : negFound;
  const adverbText = negAdverb?.text ?? adverbSurface(modifier);
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142). An adverb of
  // place (EN TODAS PARTES) leaves the manner slot too, but stands among the complements where a
  // locative does, not at their head (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  const outscopesNo = negAdverb?.slot === 'pre-negation';
  // An adverb that outscopes the negation without carrying it stands in front of the "no" and keeps
  // it: ALREADY's "ya" is "todavía no ha comido", where *tampoco* and *nunca* stand alone (P09-E28).
  const leadsNo = negAdverb?.slot === 'pre-negator';
  // Spanish fronts one negative frequency adverb ("nunca") preverbally without "no", whichever verb
  // it modifies. Scan the group outermost-first (each modal, then the main verb); the first negative
  // adverb takes that slot and is suppressed from its in-group position. `frontIdx` indexes this
  // array: 0…n-1 are the modals, n is the main verb.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  // The main verb's own adverb is not among the candidates when a modal governs it: it denies
  // that governed group, and fronting it would put the "nunca" on the modal instead (A236).
  const frontable = modals.length > 0 ? groupAdverbs.slice(0, -1) : groupAdverbs;
  const frontIdx = verbNegative ? -1 : frontable.findIndex((a) => a?.forms['polarity'] === 'negative');
  const preVerbNunca = frontIdx >= 0;
  // The main verb's own negation, which only a modal can govern: "quiero no ir". It leads the
  // governed infinitive group — before the aspect auxiliary and its enclitic ("debo no haber
  // comido", "quiero no moverme") — inside the chain, where the finite "no" never reaches. With no
  // modal the main verb IS the finite one, and `verbNegative` already carries it.
  // A negative adverb on the main verb denies the group the modal governs, not the modal: "quiere
  // no comer nunca" — the cat wants to never eat — not "nunca quiere comer" (A236).
  const governedNo = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0 ? 'no' : '';
  const conjugated = modals.length > 0
    ? [
        // Each modal's adverb trails its verb ("no quiere nunca poder ir"), except the fronted
        // negative adverb, which takes the preverbal slot instead (emitted as preVerb). An inner
        // modal's own "no" leads it ("debo no poder ir").
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: adverbSurface(m.modifier) }), 'no'),
        governedNo,
        verbGroupInfinitive(copulaVerb.forms, agreeForms, aspect),
      ].filter(Boolean).join(' ')
    : aspect === 'neutral'
      ? finite(copulaVerb)
      : aspectVerb(copulaVerb.forms, agreeForms, tense, aspect, mood);
  // A frequency adverb on the prospective belongs right after the finite "estar", not after the whole
  // periphrasis, where it would scope over the infinitive alone — "está a punto de comer SIEMPRE" reads as
  // *is about to always eat* (A147). A fronted "nunca" is already preverbal, and a manner adverb does
  // trail the group ("está a punto de comer bien"). The progressive is idiomatic either way and is left alone.
  const mainIsFronted = frontIdx === modals.length;
  const splitFrequency = !mainIsFronted && !!modifierText && modifier?.forms['subtype'] === 'frequency'
    && aspect === 'prospective' && modals.length === 0;
  // The participio closes the verb group, behind whatever auxiliaries the tense/aspect/modals built.
  const grouped = [splitFrequency
    ? [conjugated.split(' ')[0], modifierText, ...conjugated.split(' ').slice(1)].join(' ')
    : conjugated, passiveParticipleText].filter(Boolean).join(' ');
  // A "ninguno" (no) direct object is post-verbal, so it triggers negative concord —
  // "no veo ningún niño" — whereas a pre-verbal "ningún" subject does not.
  // Any "ningún" conjunct triggers the concord — "no veo ningún niño ni ninguna niña" — and so does a
  // "ningún" possessor, in the object or in a complement: "no ve la casa de ningún hombre" (A216).
  const objectIsNegative = (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false)
    // A negative subject behind the verb concords as a negative object does (A369): "al gato no le gusta ningún perro".
    || invertedSubject?.negative === true;
  const complementIsNegative = hasNegativeComplement(complements) || hasNegativePossessorComplement(complements);
  // A negator inside the governed group is preverbal for everything that follows it, so a "ningún"
  // object or complement concords with that one instead: "quiere no comer ninguna comida" takes no
  // second "no" on the modal, which would deny the modal as well (see `negationSources.governed`).
  const concordedInside = governedNo !== '' || modals.some((m) => m.negative);
  // The preverbal "no" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("ningún gato …") or a preverbal "nunca" (the finite adverb,
  // preverbal when the verb isn't itself negated) already negates the clause, so "no" is dropped.
  const needsNo = verbNegative || ((objectIsNegative || complementIsNegative) && !concordedInside)
    || finiteHasNegativeAdverb(verbPhrase);
  const verbText = needsNo && !subjectIsNegative && !preVerbNunca && !outscopesNo ? `no ${grouped}` : grouped;
  // A pronoun direct object is a proclitic before the finite verb ("el gato me ve"), sitting after
  // "no" in the negative ("no me ve"), not a post-verbal noun ("ve el yo"). A noun object keeps the
  // post-verbal slot.
  const pronounGroup = !!directObject && !objectPrep && directObject.conjuncts.length > 1
    && directObject.conjuncts.every((np) => np.head.forms['person']);
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes "a" + its
  // tonic form. A group of pronouns is doubled by its plural clitic ("el gato nos ve a mí y a ti");
  // a group mixing in a noun, where the doubling is optional, is left undoubled.
  // An elided predicate leaves the invariable "lo" in the same slot ("el perro no lo es", "los perros
  // no lo están"); an elided place leaves nothing ("el perro no está") (A121).
  // An experiencer verb doubles its dative with a clitic, which Spanish requires there: "al gato
  // **le** gusta el perro", "a los gatos **les** gustan los perros", "a mí **me** gusta el perro"
  // (localization C34). The experiencer arrives as the `terminus` complement — or, in a relative
  // clause whose head is the one who likes, as the terminus **gap**, which the relativizer renders
  // and `gapComplement` names ("el gato al que **le** gusta el perro").
  const experiencerDative = verb.forms['experiencer'] === '1' ? complements?.['terminus'] : undefined;
  const experiencerForms = experiencerDative?.phrase.conjuncts.length === 1
    ? experiencerDative.phrase.conjuncts[0].head.forms : undefined;
  const experiencerClitic =
    experiencerForms?.['person'] && experiencerForms['person'] !== '3' ? objectPronounForm(experiencerForms)
    : experiencerDative ? (experiencerDative.phrase.agreement['number'] === 'plural' ? 'les' : 'le')
    : verb.forms['experiencer'] === '1' && gapComplement === 'terminus' ? 'le'
    : '';
  const objectClitic = experiencerClitic || (!directObject ? (verbPhrase.elided?.type === 'predicative' ? 'lo' : '')
    // An object taken with the dative "a" — a dative controller, "le permite correr" (P09-E43) — is
    // still a clitic when it is a pronoun, the indirect-object one: never the tonic "permite a ella".
    : objectPrep === 'a' && isPronounElement(directObject) ? dativePronounForm(firstConjunct(directObject).head.forms)
    : objectPrep ? ''
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : pronounGroup ? groupObjectClitic(directObject) : '');
  // A human noun takes the personal "a" too ("ve al niño"), see `objectNounText`.
  // The personal "a" marks a person, so the indefinite pronoun that stands for a **thing** takes
  // none: "come algo", never "*come a algo" (C32).
  const tonicOrNoun = (np: ResolvedNounPhrase) => objectPrep ? prepObjectText(np, objectPrep)
    : np.head.forms['person']
      // An indefinite pronoun keeps its relative clause: "ve a alguien que corre" (A309).
      ? withRelative(`${np.head.forms['thing'] === '1' ? '' : 'a '}${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np)
      : objectNounText(np, verb.forms);
  // The impersonal "se" is a preverbal clitic standing in for a generic subject ("se come" — "one
  // eats"); the subject word is suppressed upstream. It leads any object clitic ("se lo come").
  // A reflexive verb already carries its own "se" in the form ("se mueve"), and the impersonal one
  // cannot stand beside it — "*se se mueve" is no sentence. The generic subject is then spelled out as a
  // word instead, written back into the subject slot the clause emptied: "uno se mueve" (A152).
  // So is the generic patient a passive promotes to the subject: "ser" has no impersonal se, and
  // "*se es visto por el gato" is no sentence either — "uno es visto por el gato" (A355).
  const isGeneric = subjectForms['generic'] === '1';
  const genericSubject = isGeneric && (passive || reflexiveClitic(copulaVerb.forms, subjectForms))
    ? (subjectForms['generic_reflexive'] ?? '') : '';
  const impersonalClitic = isGeneric && !genericSubject ? (subjectForms['base'] ?? '') : '';
  // A pronoun recipient is the dative clitic in the same slot, "le da el libro", "me da el libro"
  // (A351): the plain clitic, undoubled. Beside a 3rd-person object clitic the two are one cluster,
  // dative first, le / les turning se: "se lo da", "me lo da", riding wherever the lone clitic rides
  // (A359). The impersonal se leads a lone dative as it leads an object clitic: "se le da el libro",
  // "se me da", "no se le da" (A360); beside an object clitic too it would make "*se se lo da", so
  // there the recipient keeps its "a ella". A 1st / 2nd person object admits no dative clitic beside
  // it, and beside a pronominal verb's own se the recipient keeps its phrase rather than half a cluster.
  const clusterObject = !!directObject && !objectPrep && !experiencerClitic && isPronounElement(directObject)
    && firstConjunct(directObject).head.forms['person'] === '3' && !isGeneric;
  const recipientForms = (!objectClitic || clusterObject) && !reflexiveClitic(copulaVerb.forms, subjectForms)
    ? recipientPronoun(complements, verb.forms) : undefined;
  const recipientClitic = recipientForms ? dativePronounForm(recipientForms) : '';
  const clitic = esCliticCluster(recipientClitic, objectClitic);
  // Attached to its host, a cluster is one word, the accent placed for the longer word: "dáselo".
  const encliticCluster = clitic.replace(/ /g, '');
  const proclitics = [impersonalClitic, clitic].filter(Boolean).join(' ');
  // A passive has no direct object left — the patient is this clause's subject now — so the slot
  // after the verb carries the by-phrase instead ("es comida por el gato en la casa").
  const directObjectText = passive ? agentPhrase(agent)
    // A focus particle singles the object out, from outside the phrase: "come solo la comida" (C39).
    : directObject && (!objectClitic || pronounGroup)
      ? withFocus(coordinateElement(directObject, tonicOrNoun, true), slotFocus(directObject), FOCUS_WORDS)
      : invertedSubject?.text ?? '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  const preVerb = preVerbNunca ? adverbSurface(groupAdverbs[frontIdx]) : outscopesNo || leadsNo ? modifierText : '';
  const postVerb = mainIsFronted || splitFrequency || outscopesNo || leadsNo ? '' : modifierText;
  // A pronoun experiencer is its clitic alone: "me gusta el perro". The tonic beside it, "a mí", is
  // the contrastive reading (A369); the generic "a uno" has no clitic of its own and keeps it.
  const cliticExperiencer = !!experiencerDative && isPronounElement(experiencerDative.phrase)
    && experiencerDative.phrase.agreement['generic'] !== '1';
  const complementsText = complementsAroundAdverb(modifier, adverbText,
    recipientClitic || frontedDative || cliticExperiencer ? withoutTerminus(complements) : complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement));
  // Imperative: a subjectless command. The person picks the form (tú = 3sg-present, nosotros /
  // every negative = present subjunctive, vosotros = infinitive − r + d); a negative command
  // ("no comas", "no seáis") prefixes "no". The adverb simply trails the verb here. An object pronoun
  // attaches after an affirmative command ("cómelo", "comedlo") and after an instruction, which is an
  // infinitive ("cargarlo", "no cargarlo"); only a negative command keeps it in front ("no lo comas").
  if (mood === 'imperative') {
    // A "ningún" complement is post-verbal, and obliges the negator here as in the statement:
    // "no corras en ninguna casa" (A208).
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative;
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Spanish ("Cargar un período", "No correr"), not the imperative.
    // A reflexive command is derived from the plain verb and takes the addressee's clitic, ahead of
    // any object clitic: "no te vuelvas", "vuélvete", "volveos". The instruction keeps the citation
    // infinitive ("volverse").
    const reflexive = register === 'instruction' ? '' : reflexiveClitic(copulaVerb.forms, subjectForms);
    const impForm = register === 'instruction'
      ? (copulaVerb.forms['base'] ?? conjugated)
      : (imperativeForm('es', nonReflexiveVerb(copulaVerb), moodPN(subjectForms), impNeg) ?? conjugated);
    const enclitic = register === 'instruction' || !impNeg;
    const impVerb = enclitic
      ? `${impNeg ? 'no ' : ''}${esEnclitic(impForm, `${reflexive}${encliticCluster}`)}`
      : esCliticize([reflexive, clitic].filter(Boolean).join(' '), `no ${impForm}`);
    return [impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir el alimento"), the same surface
  // Spanish already gives the imperative `instruction` register above. Negation prefixes "no" ("no
  // consumir"); an object pronoun attaches after it ("consumirlo", "no consumirlo").
  if (mood === 'infinitive') {
    // A passive citation is the infinitive of "ser" plus the participio ("ser comida").
    // A governor that takes the gerund writes it in the infinitive's place: "sigue corriendo",
    // "sigue comiéndola" (P09-E42, `complement_form`).
    const head = verbPhrase.gerundComplement ? (copulaVerb.forms['gerund'] ?? copulaVerb.forms['base']) : copulaVerb.forms['base'];
    const inf = [head ?? conjugated, passiveParticipleText].filter(Boolean).join(' ');
    // A negative link ("sigue sin correr", A315) is the clause's negator, so it writes no "no" of its
    // own, and a negative word after it concords with it: "sin comer ninguna comida".
    const infNeg = !verbPhrase.negativeLink && (verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative);
    const infVerb = `${infNeg ? 'no ' : ''}${esEnclitic(inf, encliticCluster)}`;
    return [infVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [genericSubject, preVerb, esCliticize(proclitics, verbText), postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
