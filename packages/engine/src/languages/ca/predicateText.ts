import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { negatorLead } from '../../functions/negatorLead.js';
import { agreeingAdverb } from '../../functions/agreeingAdverb.js';
import { moreAdverbText } from '../../functions/adverbClass.js';
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
import { moodPN } from '../../mood.js';
import { ESTAR_COPULA, EXISTENTIAL_CLITIC, FOCUS_WORDS, HAVER_EXISTENTIAL } from './ca.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeAdj, agreeParticiple } from './agreeAdj.js';
import { complementsPhrase } from './complementsPhrase.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { coordinateElement } from './coordinateElement.js';
import { caCliticCluster, clusterAll } from './caCliticCluster.js';
import { caCliticize } from './caCliticize.js';
import { caEnclitic } from './caEnclitic.js';
import { caSurface } from './caSurface.js';
import { isPlural } from './isPlural.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';
import { reflexiveClitic } from './reflexiveClitic.js';
import { infinitiveGroup, verbGroup } from './verbGroup.js';
import { withRelative } from './withRelative.js';

/**
 * The predicate half of a phrase — everything after the subject noun. Shared by the top-level sentence
 * and by relative clauses, which pass the head noun's forms as `subjectForms` so the verb agrees with
 * the head.
 *
 * Catalan is Spanish's shape (P03 §2.2): pro-drop, *no* before the finite verb, the weak pronouns
 * before it and after an infinitive or a command, negative concord. The verb forms are read from the
 * stored cells (`verbGroup`, `finiteCell`), the past is the periphrastic *va menjar* (D2), and a
 * negative word keeps the preverbal *no* wherever it stands: "no menja mai", "cap gat no menja", "tampoc
 * no menja" — the IEC's formal register, where Spanish drops its "no" before "nunca" (verify).
 */
export function predicateText(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject?: ResolvedNounElement,
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  // The demoted agent of a passive clause, rendered as the "per" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a preverbal `no` phrase ("cap gat"). The caller's (A167).
  subjectIsNegative = subjectForms['definiteness'] === 'no',
  // The complement slot a relative clause's head fills, for a clause that IS a relative (A199).
  gapComplement?: ComplementType,
  // The subject an experiencer clause says after the verb, and whether its dative was fronted, which
  // leaves only the clitic here: "al gat li agrada **el gos**" (A369, see `experiencerInverts`).
  invertedSubject?: InvertedSubject,
  frontedDative = false,
): string {
  return caSurface(predicate(subjectForms, verbPhrase, directObject, complements, agent, subjectIsNegative, gapComplement, invertedSubject, frontedDative));
}

function predicate(
  subjectForms: Record<string, string>,
  verbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounElement | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  agent: ResolvedNounElement | undefined,
  subjectIsNegative: boolean,
  gapComplement: ComplementType | undefined,
  invertedSubject: InvertedSubject | undefined,
  frontedDative: boolean,
): string {
  const { verb: givenVerb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals: givenModals } = verbPhrase;
  // An existential conjugates *haver-hi* for the HAVE it was resolved with (P09-E6 D5): "hi ha un gat".
  const existential = verbPhrase.existential === true;
  const verb = existential ? HAVER_EXISTENTIAL : givenVerb;
  // A modal's particle is its lexeme's `infinitive_link` (*haver de*); the shared chain reads `link`.
  const modals = givenModals.map((m) => {
    const link = m.verb.forms['link'] ?? m.verb.forms['infinitive_link'];
    return link ? { ...m, verb: { ...m.verb, forms: { ...m.verb.forms, link } } } : m;
  });
  // With a plural noun object the impersonal *es* is the passive *es*, and the finite verb agrees with
  // its patient: "es mengen els ratolins". A pronoun object keeps *es* impersonal.
  const objectPrep = objectPreposition(verb);
  const passiveSe = subjectForms['generic'] === '1' && !!directObject && !objectPrep && !isPronounElement(directObject)
    && directObject.agreement['number'] === 'plural'
    && !directObject.conjuncts.some((np) => np.head.forms['person']);
  const agreeForms = passiveSe ? { ...subjectForms, number: 'plural' } : subjectForms;
  const pn = moodPN(agreeForms);
  // A pronominal verb's stored cells carry a fixed clitic ("es torna"), so its group is built on the
  // plain verb and takes the subject's clitic: in front of the finite word ("em torno", "es va tornar",
  // "s'ha tornat") or after the gerund or infinitive that carries it ("està tornant-se").
  const finite = (m: ConceptForms): string => {
    const clitic = reflexiveClitic(m.forms, agreeForms);
    const group = verbGroup(nonReflexiveVerb(m).forms, pn, tense, 'neutral', mood);
    return clitic ? `${clitic} ${group.text}` : group.text;
  };
  // A47: the copula. *estar* takes a transient predicate adjective ("està cansat"); every other BE is
  // *ser*, location included: "el gat és a la casa" (the IEC standard, where Spanish must say "está",
  // verify). An elided subject complement (A121) picks the copula it would pick if spoken.
  const { elided } = verbPhrase;
  const predicative = complements?.predicative ?? (elided?.type === 'predicative' ? elided.complement : undefined);
  const predicativeHead = predicative ? firstConjunct(predicative.phrase).head.forms : undefined;
  const transientPredicative =
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1'
    // A superlative identifies the subject as a predicate noun does: "el gat és el més feliç" (A284).
    && predicativeHead['degree'] !== 'most' && predicativeHead['degree'] !== 'least';
  // The passive conjugates *ser* and agrees the lexical verb's participle with the promoted patient:
  // "el ratolí és menjat", "les cases són construïdes".
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const copulaVerb = passive ? verbPhrase.passiveAux!
    : verb.conceptId === 'BE' && transientPredicative ? ESTAR_COPULA : verb;
  const passiveParticipleText = passive
    ? agreeParticiple(verb.forms, passiveParticiple(verb), subjectForms['gender'] ?? 'masc', isPlural(subjectForms))
    : '';
  // TOGETHER is an agreeing adjective in Catalan as in Spanish ("les gates mengen juntes", A162).
  const adverbSurface = (a?: ConceptForms): string => {
    if (!a) return '';
    const stem = agreeingAdverb(a);
    return stem
      ? agreeAdj({ base: stem }, subjectForms['gender'] ?? 'masc', isPlural(subjectForms))
      : (a.forms['base'] ?? '');
  };
  // A focus adverb under the negation takes its negative-polarity word ("tampoc", A245); under a
  // negation a modal governs it takes it in the governed group (P09-E28 follow-up).
  const governedOnly = verbNegative !== true && governedNegative === true && modals.length > 0;
  const negFound = negativeAdverb(modifier, verbNegative === true || governedOnly);
  const negAdverb = negFound && governedOnly ? { text: negFound.text } : negFound;
  const adverbText = negAdverb?.text ?? adverbSurface(modifier);
  // A direction adverb follows a noun object, as a direction complement does (A142); an adverb of place
  // stands among the complements (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // The further adverbs (P15): frequency after the primary, manner after them, direction and place
  // among the complements.
  const moreFrequency = moreAdverbText(verbPhrase, 'frequency', adverbSurface);
  const moreManner = moreAdverbText(verbPhrase, 'manner', adverbSurface);
  // An adverb that outscopes the negation stands in front of the verb group: "tampoc no menja"; one
  // that leads the negator with a word of its own does too: "encara no ha menjat" (P09-E28).
  const outscopesNo = negAdverb?.slot === 'pre-negation';
  const leadsNo = negAdverb?.slot === 'pre-negator';
  // The main verb's own negation, which only a modal can govern: "vol no anar-hi" is "vol no anar". It
  // leads the governed infinitive group, and a negative adverb with a word of its own leads it ("pot ja
  // no córrer", localization B84).
  const lead = negatorLead(modifier);
  const governedNo = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0
    ? [lead, 'no'].filter(Boolean).join(' ') : '';
  // A negative adverb that is its own "no" with a word in front — NO_LONGER's *ja no* — stands before the
  // verb in place of the clause's "no": "el gat ja no menja". Scan the group outermost-first (each
  // modal, then the main verb); under a modal the main verb's own denies the governed group instead
  // (A236). Every other negative adverb (*mai*) stays after the verb, the "no" before it.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  const frontable = modals.length > 0 ? groupAdverbs.slice(0, -1) : groupAdverbs;
  const frontIdx = verbNegative ? -1 : frontable.findIndex((a) => a?.forms['polarity'] === 'negative' && !!a.forms['negator_lead']);
  const mainIsFronted = frontIdx === modals.length;
  const plainCopula = nonReflexiveVerb(copulaVerb).forms;
  const ownClitic = reflexiveClitic(copulaVerb.forms, agreeForms);
  // The existential's *hi* is a proclitic before a finite *haver* ("no hi ha") and an enclitic on its
  // infinitive under a modal ("pot haver-hi").
  const existentialOnInfinitive = existential && modals.length > 0;
  let conjugated: string;
  if (modals.length > 0) {
    conjugated = [
      // Each modal's adverb trails its verb ("no vol mai poder anar"); an inner modal's own "no" leads it.
      ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: adverbSurface(m.modifier) }), 'no'),
      governedNo,
      infinitiveGroup(plainCopula, aspect, existentialOnInfinitive ? EXISTENTIAL_CLITIC : ownClitic),
    ].filter(Boolean).join(' ');
  } else if (aspect === 'neutral') {
    conjugated = finite(copulaVerb);
  } else {
    const group = verbGroup(plainCopula, pn, tense, aspect, mood, ownClitic);
    conjugated = ownClitic && group.leads ? `${ownClitic} ${group.text}` : group.text;
  }
  // A frequency adverb on the prospective belongs right after the finite "estar" (A147).
  const splitFrequency = !mainIsFronted && !!modifierText && modifier?.forms['subtype'] === 'frequency'
    && aspect === 'prospective' && modals.length === 0;
  const grouped = [splitFrequency
    ? [conjugated.split(' ')[0], modifierText, moreFrequency, ...conjugated.split(' ').slice(1)].filter(Boolean).join(' ')
    : conjugated, passiveParticipleText].filter(Boolean).join(' ');
  // Negative concord: a *cap* object, a negative complement or possessor, a negative adverb or a
  // negative subject behind the verb all take the preverbal *no* ("no veu cap gat").
  const objectIsNegative = (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false)
    || invertedSubject?.negative === true;
  const complementIsNegative = hasNegativeComplement(complements) || hasNegativePossessorComplement(complements);
  // A negator inside the governed group is preverbal for everything after it: "vol no menjar cap
  // menjar" takes no second "no" on the modal (see `negationSources.governed`).
  const concordedInside = governedNo !== '' || modals.some((m) => m.negative);
  // A preverbal negative subject keeps the "no" too: "cap gat no menja el ratolí" (verify).
  const needsNo = verbNegative || ((objectIsNegative || complementIsNegative || subjectIsNegative) && !concordedInside)
    || finiteHasNegativeAdverb(verbPhrase);
  const verbText = needsNo && frontIdx < 0 ? `no ${grouped}` : grouped;
  // A pronoun direct object is a proclitic before the finite verb ("el gat em veu", "no el veu").
  const pronounGroup = !!directObject && !objectPrep && directObject.conjuncts.length > 1
    && directObject.conjuncts.every((np) => np.head.forms['person']);
  // An experiencer verb doubles its dative with a clitic: "al gat li agrada el gos", "als gats els
  // agraden els gossos", "a mi m'agrada el gos" (localization C34), or in a relative on the one who
  // likes, "el gat a qui li agrada el gos".
  const experiencerDative = verb.forms['experiencer'] === '1' ? complements?.['terminus'] : undefined;
  const experiencerForms = experiencerDative?.phrase.conjuncts.length === 1
    ? experiencerDative.phrase.conjuncts[0].head.forms : undefined;
  const experiencerClitic =
    experiencerForms?.['person'] && experiencerForms['person'] !== '3' ? objectPronounForm(experiencerForms)
    : experiencerDative ? (experiencerDative.phrase.agreement['number'] === 'plural' ? 'els' : 'li')
    : verb.forms['experiencer'] === '1' && gapComplement === 'terminus' ? 'li'
    : '';
  // An elided predicate leaves the neuter *ho* ("el gos no ho està"), an elided place *hi* ("el gos
  // no hi és") (A121).
  const objectClitic = experiencerClitic || (!directObject ? (elided?.type === 'predicative' ? 'ho' : elided?.type === 'locative' ? 'hi' : '')
    : objectPrep === 'a' && isPronounElement(directObject) ? dativePronounForm(firstConjunct(directObject).head.forms)
    : objectPrep ? ''
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : pronounGroup ? groupObjectClitic(directObject) : '');
  // Catalan has no personal *a*: "veu el nen". A coordination holding a pronoun is doubled by its
  // clitic and each pronoun takes "a" + its tonic form: "el gat ens veu a mi i a tu".
  const tonicOrNoun = (np: ResolvedNounPhrase) => objectPrep ? prepObjectText(np, objectPrep)
    : np.head.forms['person']
      ? withRelative(`${np.head.forms['thing'] === '1' ? '' : 'a '}${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np)
      : npText(np);
  // The impersonal *es* is a proclitic standing in for a generic subject ("es menja", P03 D5); a
  // pronominal verb already carries its own *es*, and a passive has none, so there the generic subject
  // is the word *un* in the subject slot: "un es torna feliç", "un és vist pel gat" (A152, A355).
  const isGeneric = subjectForms['generic'] === '1';
  const genericSubject = isGeneric && (passive || ownClitic)
    ? (subjectForms['generic_reflexive'] ?? '') : '';
  const impersonalClitic = isGeneric && !genericSubject ? (subjectForms['base'] ?? '') : '';
  // A pronoun recipient is the dative clitic in the same slot: "li dona el llibre", "em dona el llibre"
  // (A351); beside a 3rd-person object clitic the two are one cluster, "l'hi dona", "me'l dona" (A359).
  const clusterObject = !!directObject && !objectPrep && !experiencerClitic && isPronounElement(directObject)
    && firstConjunct(directObject).head.forms['person'] === '3' && !isGeneric;
  const recipientForms = (!objectClitic || clusterObject) && !ownClitic
    ? recipientPronoun(complements, verb.forms) : undefined;
  const recipientClitic = recipientForms ? dativePronounForm(recipientForms) : '';
  const clitic = caCliticCluster(recipientClitic, objectClitic);
  const existentialClitic = existential && !existentialOnInfinitive ? EXISTENTIAL_CLITIC : '';
  const proclitics = clusterAll([impersonalClitic, clitic, existentialClitic]);
  // A passive has no direct object left, so the slot after the verb carries the by-phrase.
  const directObjectText = passive ? agentPhrase(agent)
    : directObject && (!objectClitic || pronounGroup)
      ? withFocus(coordinateElement(directObject, tonicOrNoun, true), slotFocus(directObject), FOCUS_WORDS)
      : invertedSubject?.text ?? '';
  const preVerb = frontIdx >= 0 ? adverbSurface(groupAdverbs[frontIdx]) : outscopesNo || leadsNo ? modifierText : '';
  const postVerb = [
    mainIsFronted || splitFrequency || outscopesNo || leadsNo || (!!lead && governedNo !== '') ? '' : modifierText,
    splitFrequency ? '' : moreFrequency,
    moreManner,
  ].filter(Boolean).join(' ');
  // A pronoun experiencer is its clitic alone: "m'agrada el gos" (A369); the generic "a un" keeps it.
  const cliticExperiencer = !!experiencerDative && isPronounElement(experiencerDative.phrase)
    && experiencerDative.phrase.agreement['generic'] !== '1';
  const complementsText = complementsAroundAdverb(modifier, adverbText,
    recipientClitic || frontedDative || cliticExperiencer ? withoutTerminus(complements) : complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement),
    { direction: moreAdverbText(verbPhrase, 'direction', adverbSurface), place: moreAdverbText(verbPhrase, 'place', adverbSurface) });
  // Imperative (P03 D4): a subjectless command. tu, nosaltres and vosaltres read the stored
  // `*_imperative` cells ("menja", "mengem", "mengeu"); a negative command is *no* + the present
  // subjunctive ("no mengis", "no mengeu"). A weak pronoun follows the affirmative command ("menja'l",
  // "torna't") and an instruction's infinitive ("carregar-lo"), and precedes the negative one ("no el
  // mengis", "no et tornis").
  if (mood === 'imperative') {
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative;
    // An instruction addressed to nobody — a button, a menu entry — is the infinitive ("Carregar un
    // període", "No córrer"), as in Spanish (verify: Catalan software often says the imperative).
    const reflexive = register === 'instruction' ? '' : ownClitic;
    const ipn = pn === '1pl' || pn === '2pl' ? pn : '2sg';
    const impForm = register === 'instruction'
      ? (copulaVerb.forms['base'] ?? conjugated)
      : (impNeg ? plainCopula[`${ipn}_subjunctive`] : plainCopula[`${ipn}_imperative`]) ?? plainCopula[`${ipn}_present`] ?? conjugated;
    const enclitic = register === 'instruction' || !impNeg;
    const commandClitics = clusterAll([reflexive, clitic]);
    const negated = enclitic
      ? `${impNeg ? 'no ' : ''}${caEnclitic(impForm, commandClitics)}`
      : caCliticize(commandClitics, `no ${impForm}`);
    const impVerb = impNeg && lead ? `${lead} ${negated}` : negated;
    return [impVerb, lead ? '' : modifierText, moreFrequency, moreManner, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir l'aliment"), a pronoun attached after
  // it ("consumir-lo", "no consumir-lo").
  if (mood === 'infinitive') {
    // A governor that takes the gerund writes it in the infinitive's place: "segueix corrent" (P09-E42).
    const head = verbPhrase.gerundComplement ? caEnclitic(plainCopula['gerund'] ?? plainCopula['base'] ?? '', ownClitic) : copulaVerb.forms['base'];
    const inf = [head ?? conjugated, passiveParticipleText].filter(Boolean).join(' ');
    // A negative link ("segueix sense córrer", A315) is the clause's negator.
    const infNeg = !verbPhrase.negativeLink && (verbNegative === true || objectIsNegative || modifierIsNegative || complementIsNegative);
    const infVerb = `${infNeg ? (lead ? `${lead} no ` : 'no ') : ''}${caEnclitic(inf, clusterAll([clitic, existentialClitic]))}`;
    return [infVerb, infNeg && lead ? '' : modifierText, moreFrequency, moreManner, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [genericSubject, preVerb, caCliticize(proclitics, verbText), postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
