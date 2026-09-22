import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { groupHasNegativeAdverb } from '../../functions/groupHasNegativeAdverb.js';
import { agreeingAdverb } from '../../functions/agreeingAdverb.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { groupObjectClitic } from '../../functions/groupObjectClitic.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { modalChain } from '../../functions/modalChain.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { ESTAR_COPULA } from './es.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeAdj } from './agreeAdj.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinateElement } from './coordinateElement.js';
import { esCliticize } from './esCliticize.js';
import { esEnclitic } from './esEnclitic.js';
import { isPlural } from './isPlural.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { objectNounText } from './objectNounText.js';
import { prepObjectText } from './prepObjectText.js';
import { reflexiveClitic } from './reflexiveClitic.js';
import { takesPersonalA } from './takesPersonalA.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

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
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
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
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1';
  // A relativised place is the gap, not a complement, and it predicates just as a spoken one does:
  // "la casa donde el gato está arde" (A199).
  const locativeAlone = (!!locative || gapComplement === 'locative') && !predicative;
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
  // A modal chain makes the outermost modal the finite verb ("quiero poder ir"); "no" is
  // prepended below and lands in front of it, exactly as for a plain verb.
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
  const adverbText = adverbSurface(modifier);
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142). An adverb of
  // place (EN TODAS PARTES) leaves the manner slot too, but stands among the complements where a
  // locative does, not at their head (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // Spanish fronts one negative frequency adverb ("nunca") preverbally without "no", whichever verb
  // it modifies. Scan the group outermost-first (each modal, then the main verb); the first negative
  // adverb takes that slot and is suppressed from its in-group position. `frontIdx` indexes this
  // array: 0…n-1 are the modals, n is the main verb.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  const frontIdx = verbNegative ? -1 : groupAdverbs.findIndex((a) => a?.forms['polarity'] === 'negative');
  const preVerbNunca = frontIdx >= 0;
  const conjugated = modals.length > 0
    ? [
        // Each modal's adverb trails its verb ("no quiere nunca poder ir"), except the fronted
        // negative adverb, which takes the preverbal slot instead (emitted as preVerb).
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: adverbSurface(m.modifier) })),
        verbGroupInfinitive(copulaVerb.forms, agreeForms, aspect),
      ].join(' ')
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
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false;
  const complementIsNegative = hasNegativeComplement(complements) || hasNegativePossessorComplement(complements);
  // The preverbal "no" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("ningún gato …") or a preverbal "nunca" (the finite adverb,
  // preverbal when the verb isn't itself negated) already negates the clause, so "no" is dropped.
  const needsNo = verbNegative || objectIsNegative || complementIsNegative || groupHasNegativeAdverb(verbPhrase);
  const verbText = needsNo && !subjectIsNegative && !preVerbNunca ? `no ${grouped}` : grouped;
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
  const objectClitic = !directObject ? (verbPhrase.elided?.type === 'predicative' ? 'lo' : '')
    : objectPrep ? ''
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : pronounGroup ? groupObjectClitic(directObject) : '';
  // A human noun takes the personal "a" too ("ve al niño"), see `objectNounText`.
  const tonicOrNoun = (np: ResolvedNounPhrase) => objectPrep ? prepObjectText(np, objectPrep)
    : np.head.forms['person'] ? `a ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}` : objectNounText(np, verb.forms);
  // The impersonal "se" is a preverbal clitic standing in for a generic subject ("se come" — "one
  // eats"); the subject word is suppressed upstream. It leads any object clitic ("se lo come").
  // A reflexive verb already carries its own "se" in the form ("se mueve"), and the impersonal one
  // cannot stand beside it — "*se se mueve" is no sentence. The generic subject is then spelled out as a
  // word instead, written back into the subject slot the clause emptied: "uno se mueve" (A152).
  const isGeneric = subjectForms['generic'] === '1';
  const genericSubject = isGeneric && reflexiveClitic(copulaVerb.forms, subjectForms)
    ? (subjectForms['generic_reflexive'] ?? '') : '';
  const impersonalClitic = isGeneric && !genericSubject ? (subjectForms['base'] ?? '') : '';
  const proclitics = [impersonalClitic, objectClitic].filter(Boolean).join(' ');
  // A passive has no direct object left — the patient is this clause's subject now — so the slot
  // after the verb carries the by-phrase instead ("es comida por el gato en la casa").
  const directObjectText = passive ? agentPhrase(agent)
    : directObject && (!objectClitic || pronounGroup) ? coordinateElement(directObject, tonicOrNoun, true) : '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  const preVerb = preVerbNunca ? adverbSurface(groupAdverbs[frontIdx]) : '';
  const postVerb = mainIsFronted || splitFrequency ? '' : modifierText;
  const complementsText = complementsAroundAdverb(modifier, adverbText, complements,
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
      ? `${impNeg ? 'no ' : ''}${esEnclitic(impForm, `${reflexive}${objectClitic}`)}`
      : esCliticize([reflexive, objectClitic].filter(Boolean).join(' '), `no ${impForm}`);
    return [impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir el alimento"), the same surface
  // Spanish already gives the imperative `instruction` register above. Negation prefixes "no" ("no
  // consumir"); an object pronoun attaches after it ("consumirlo", "no consumirlo").
  if (mood === 'infinitive') {
    // A passive citation is the infinitive of "ser" plus the participio ("ser comida").
    const inf = [copulaVerb.forms['base'] ?? conjugated, passiveParticipleText].filter(Boolean).join(' ');
    const infNeg = verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative;
    const infVerb = `${infNeg ? 'no ' : ''}${esEnclitic(inf, objectClitic)}`;
    return [infVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [genericSubject, preVerb, esCliticize(proclitics, verbText), postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
