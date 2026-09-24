import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { dativePronounForm } from '../../functions/dativePronounForm.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { lemmaTail } from '../../functions/lemmaTail.js';
import { modalChain } from '../../functions/modalChain.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { splitLemmaTail } from '../../functions/splitLemmaTail.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { FOCUS_WORDS, IT_REFLEXIVE, IT_SHORT_IMPERATIVE } from './it.consts.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeAdj } from './agreeAdj.js';
import { agreementForms } from './agreementForms.js';
import { alarmCryText } from './alarmCryText.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { coordinate } from './coordinate.js';
import { itEnclitic } from './itEnclitic.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';
import { reflexiveClitic } from './reflexiveClitic.js';
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
  // The demoted agent of a passive clause, rendered as the "da" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a preverbal `no` phrase ("nessun gatto"), which already negates
  // the clause. The caller's, as in English and German (see `negationSources`): a subject relative is
  // handed its head's forms for agreement, but a `no` head negates the MATRIX clause, not the relative
  // one (A167). It defaults to the forms' own `no`, which is right wherever they are the subject's.
  subjectIsNegative = subjectForms['definiteness'] === 'no',
  // The passive si's patient when it is not spoken here: an object relative's gapped head, which the
  // participle of the compound tense agrees with as it agrees with a spoken one ("l'opzione che si è
  // salvata", "i libri che si sono salvati"). See `relativeText`.
  gappedPatient?: Record<string, string>,
): string {
  const { verb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // A verb that takes its object with a preposition ("clicca sul pulsante", A139) has no direct object to
  // agree with, be a clitic or become the passive si's subject: "si clicca sui pulsanti", "clicca su di me".
  const objectPrep = objectPreposition(verb);
  // In a hypothetical conditional the finite element (the outermost modal, or the main verb)
  // takes the conditional (apodosis) or imperfect-subjunctive (protasis) form; the marked
  // aspects keep their indicative auxiliary (aspect under a conditional is a documented gap).
  // With a plural noun object the impersonal si is the passive si, and the finite verb agrees with its
  // patient: "si mangiano i topi", "si devono mangiare i topi", and in the compound tense the participle
  // too ("si sono mangiati i topi"). A clitic object keeps si impersonal ("li si mangia"), and so does
  // an alarm cry, which is not a direct object ("si grida ai lupi").
  // The patient is the passive si's in either number, and a compound tense agrees its participle with
  // it — "si è salvata l'opzione" as "si sono salvate le opzioni"; only the plural moves the finite verb.
  const siPatient = subjectForms['generic'] === '1' && !!directObject && !objectPrep && !isPronounElement(directObject)
    && !directObject.conjuncts.every((np) => alarmCry(verb, np));
  const passiveSi = siPatient && directObject!.agreement['number'] === 'plural';
  const agreeForms = passiveSi ? { ...subjectForms, number: 'plural' } : subjectForms;
  const pn = moodPN(agreeForms);
  // A third-person object clitic sits ahead of an avere participle, which agrees with it: "l'ha
  // vista", "li ha visti", "la deve aver vista". With mi / ti / ci / vi the agreement is optional
  // and left out.
  // A verb whose object takes the dative "a" (telefonare a, credere a) still cliticizes a pronoun
  // one, as the indirect-object clitic: "gli telefona", not the contrastive tonic "telefona a lui"
  // (A240). Any other preposition is spatial and keeps the tonic form after it ("clicca su di lui").
  const datClitic = objectPrep === 'a';
  // An existential's pivot is no object to cliticize: it is what the verb agrees with, spoken after
  // it, and the clitic slot holds the existential "ci" (P09-E6 D5).
  const existential = verbPhrase.existential === true;
  const cliticObject = directObject && !existential && (!objectPrep || datClitic) && isPronounElement(directObject)
    ? firstConjunct(directObject).head.forms : undefined;
  // A dative clitic is no direct object, so no participle agrees with it ("gli ha telefonato").
  const agreeingObject = cliticObject?.['person'] === '3' && !datClitic ? cliticObject
    : siPatient ? directObject!.agreement
    : subjectForms['generic'] === '1' ? gappedPatient : undefined;
  // A state verb's past is the imperfect ("voleva", "aveva", "era"), not the perfective (A130).
  const finite = (m: ConceptForms) => moodForm('it', m, pn, mood) ?? statePastForm('it', m, pn, tense, mood) ?? conjugate(m.forms, agreeForms, tense);
  // A pronominal verb ("muoversi") is conjugated as its plain verb, and its clitic, agreeing with the
  // subject, is placed apart: before the finite verb and before essere in the compound tenses ("si
  // muove", "si è mosso", "si muovesse"), attached to the infinitive and the gerund ("deve muoversi",
  // "sta per muovermi", "sta muovendosi") and after an affirmative command ("muoviti"). Under the
  // impersonal si it is "ci" and climbs to the finite verb whatever follows: "ci si deve muovere".
  //
  // The passive conjugates "essere" where the active conjugates the lexical verb, and agrees that
  // verb's participio with the promoted patient — now this clause's subject — as an essere
  // participle always agrees ("il cibo è mangiato", "l'acqua è mangiata"). Because every branch
  // below builds its group out of `plain`, the composition comes for free and stays idiomatic:
  // "è stato mangiato" (the perfect of essere), "sta essendo mangiato", "deve essere mangiato",
  // "sarebbe stato mangiato". A passive is never reflexive, whatever the lexical verb is.
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const plain = passive ? verbPhrase.passiveAux! : nonReflexiveVerb(verb);
  const participleForms = agreementForms(subjectForms);
  const passiveParticipleText = passive
    ? agreeAdj(passiveParticiple(verb),
      participleForms['gender'] ?? 'masc', (participleForms['number'] ?? 'singular') === 'plural')
    : '';
  const reflexive = passive ? '' : reflexiveClitic(verb.forms, agreeForms);
  const reflexiveLeads = subjectForms['generic'] === '1' || (modals.length === 0 && (aspect === 'neutral' || aspect === 'resultative'));
  const leadingReflexive = reflexiveLeads ? reflexive : '';
  const attachedReflexive = reflexiveLeads ? '' : reflexive;
  // A modal chain makes the outermost modal the finite verb; every inner modal takes its
  // apocopated infinitive ("voglio poter andare") and the main verb closes the chain as the
  // infinitive of its whole group. "non" is prepended below, exactly as for a plain verb.
  // The main verb's own negation, which only a modal can govern: "voglio non andare". It leads the
  // governed infinitive, inside the chain, where the finite "non" of `negText` never reaches.
  // A negative adverb on the main verb is the governed group's own negator too: "vuole non mangiare
  // mai" — the cat wants to never eat — where sending it to the finite verb would say it never
  // wants to eat (A236).
  const governedNon = (governedNegative === true || governedHasNegativeAdverb(verbPhrase)) && modals.length > 0 ? 'non' : '';
  const verbGroup = modals.length > 0
    ? [
        // Italian adverbs are postverbal, so each modal's own adverb trails its verb ("non
        // voglio mai poter sempre andare"); the main verb's adverb is appended after the group.
        // An inner modal's own "non" leads it ("devo non poter andare").
        ...modalChain(modals, finite, (m) => ({ post: m.modifier?.forms['base'] }), 'non'),
        governedNon,
        verbGroupInfinitive(plain.forms, subjectForms, aspect, agreeingObject, attachedReflexive),
      ].filter(Boolean).join(' ')
    : aspect === 'neutral'
      ? finite(plain)
      : aspectVerb(plain.forms, agreeForms, tense, aspect, mood, agreeingObject, attachedReflexive);
  // The participio closes the verb group, behind whatever auxiliaries the tense/aspect/modals built.
  const verbText = [verbGroup, passiveParticipleText].filter(Boolean).join(' ');
  // "mai" always requires "non": "io non bevo mai" even without verbNegative.
  // A "nessun" (no) direct object is post-verbal, so it triggers negative concord —
  // "non vede nessun ragazzo" — whereas a pre-verbal "nessun" subject does not.
  // A negative adverb (mai) anywhere in the group — main verb or any modal — forces "non".
  const modifierIsNegative = finiteHasNegativeAdverb(verbPhrase);
  // Any "nessun" conjunct triggers the concord — "non vede nessun ragazzo e nessuna ragazza" — and so
  // does a "nessun" possessor: "non vede la casa di nessun uomo" (A216).
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false;
  // A postverbal negative word — a `no`-determined direct object OR complement ("in nessuna casa",
  // "a nessun mercato"), or a `no` possessor in one ("nella casa di nessun uomo") — obliges the
  // preverbal "non", the same concord as a negative object. But a preverbal negative SUBJECT
  // ("nessun gatto") already negates the clause and carries it, so the "non" is suppressed then:
  // "nessun gatto mangia nessun topo", not "… non mangia …".
  // A negator inside the governed group is preverbal for everything that follows it, so a "nessun"
  // object or complement concords with that one: "vuole non mangiare nessun cibo" takes no second
  // "non" on the modal, which would deny the modal instead of the verb.
  const concordedInside = governedNon !== '' || modals.some((m) => m.negative);
  const negText = (verbNegative || modifierIsNegative
    || ((objectIsNegative || hasNegativeComplement(complements) || hasNegativePossessorComplement(complements))
      && !concordedInside)) && !subjectIsNegative ? 'non' : '';
  // A pronoun direct object is a proclitic before the finite verb ("il gatto mi vede"), not a
  // post-verbal noun ("vede l'io"). It renders in front of the verb in the indicative and enclitic
  // on the imperative ("guardami"); a noun object keeps the post-verbal slot.
  // An elided subject complement leaves its pro-form in the same slot (A121): the invariable "lo" for
  // a predicate ("il cane non lo è", "i cani lo sono"), "ci" for a place ("il cane non c'è").
  const elided = verbPhrase.elided;
  // An existential is "c'è / ci sono": the same locative "ci", in the same slot, with the pivot after
  // the verb as a noun object would stand (P09-E6 D5).
  const objectClitic = existential ? 'ci'
    : cliticObject
      ? (datClitic ? dativePronounForm(cliticObject) : objectPronounForm(cliticObject))
      : elided ? (elided.type === 'predicative' ? 'lo' : 'ci') : '';
  // The locative "ci" elides before the e- forms of essere: "c'è", "c'era", "non c'è mai stato".
  const elideCi = (text: string): string => (elided?.type === 'locative' || existential
    ? text.replace(/(^|\s)ci (?=[eè])/, "$1c'")
    : text);
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes its tonic
  // form with no article ("vede il cane e te", "vede lui e me"). The alarm a cry raises takes "a" and
  // the article ("gridò al lupo", A124).
  const tonicOrNoun = (np: ResolvedNounPhrase) => {
    if (objectPrep) return prepObjectText(np, objectPrep);
    if (np.head.forms['person']) return np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '';
    const cry = alarmCry(verb, np);
    return cry ? alarmCryText(cry) : npText(np);
  };
  // The impersonal "si" is a preverbal clitic standing in for a generic subject ("si mangia" —
  // "one eats"). It sits after any "non", closest to the verb, so an object clitic comes before it
  // ("lo si mangia", "non lo si mangia", "mi si vede"); the subject word itself is suppressed upstream.
  const impersonalClitic = subjectForms['generic'] === '1' ? (subjectForms['base'] ?? '') : '';
  // A passive has no direct object left — the patient is this clause's subject now — so the slot
  // after the verb carries the by-phrase instead ("è mangiato dal gatto nella casa").
  const directObjectText = passive ? agentPhrase(agent)
    // A focus particle singles the object out, from outside the phrase: "mangia solo il cibo" (C39).
    : directObject && (!objectClitic || existential) ? withFocus(coordinate(directObject, tonicOrNoun), slotFocus(directObject), FOCUS_WORDS) : '';
  // A focus adverb under a negation takes its negative-polarity word in the same slot, where
  // Italian has one: "non mangia neanche il cibo", not "*non mangia anche il cibo" (A245).
  const negAdverb = negativeAdverb(modifier, verbNegative === true);
  const adverbText = negAdverb?.text ?? (modifier ? (modifier.forms['base'] ?? '') : '');
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142). An adverb of
  // place (EVERYWHERE) leaves the manner slot too, but stands among the complements where a locative
  // does, not at their head (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  const complementsText = complementsAroundAdverb(modifier, adverbText, complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement, verb.forms));
  // Imperative: a subjectless command. The subject pronoun's person picks the form (tu / noi /
  // voi); the negative changes it (non + infinito for tu, "non" + the affirmative form for
  // noi/voi). "non" already sits in negText, so reuse it as the negation flag and prefix.
  if (mood === 'imperative') {
    // Italian is the one Romance language whose UI labels keep the imperative ("Salva", "Carica"),
    // so an instruction only pins the person to tu — it has no addressee to take noi/voi from.
    const impPN = register === 'instruction' ? '2sg' : moodPN(subjectForms);
    const impForm = imperativeForm('it', plain, impPN, negText === 'non') ?? verbText;
    // The clitic attaches after the command: the negative tu's infinitive drops its -e ("non
    // mangiarlo"), and the short da' / fa' / va' double its consonant ("dallo", "fammi"). A
    // pronominal verb's clitic is the addressee's, and leads any other: "muoviti", "non muoverti",
    // "muoviamoci".
    const infinitive = negText === 'non' && impPN === '2sg';
    const short = !infinitive && impPN === '2sg' && IT_SHORT_IMPERATIVE.has(verb.conceptId);
    const impReflexive = reflexive ? (IT_REFLEXIVE[impPN] ?? '') : '';
    const impVerb = itEnclitic(impForm, `${impReflexive}${objectClitic}`, infinitive ? 'infinitive' : short ? 'short' : 'plain');
    return [negText, impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumare il cibo"). This is the true
  // dictionary form — distinct from the imperative `instruction` register above, which Italian
  // renders as the 2sg ("consuma"). Negation is preverbal "non"; an object pronoun (never a
  // definition's own full-NP object, but supported for completeness) attaches enclitically,
  // dropping the infinitive's final -e ("consumarlo").
  if (mood === 'infinitive') {
    // A passive citation is the infinitive of the auxiliary plus the participio ("essere mangiato"),
    // the same two pieces every other branch builds, in the one mood that has no finite verb.
    const inf = passive
      ? [plain.forms['base'] ?? '', passiveParticipleText].filter(Boolean).join(' ')
      : verb.forms['base'] ?? verbText;
    const infWithClitic = itEnclitic(inf, objectClitic, 'infinitive');
    return [negText, infWithClitic, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Italian slots a FREQUENCY adverb right after the FINITE verb of a periphrasis, not after the
  // whole group — where a MANNER adverb does belong ("ha mangiato bene", "sta per mangiare bene").
  // The compound perfect puts it between auxiliary and participle ("ha SEMPRE mangiato", "non ha
  // MAI mangiato", A28); the progressive and the prospective put it after "stare", where trailing
  // it would scope it over the non-finite verb alone ("sta per amare SEMPRE" is *is about to always
  // love*, A147). A simple tense ("mangia sempre") and a modal chain ("deve mangiare sempre") have
  // no periphrastic finite to follow, so both stay on the append path below.
  // An adverb that scopes over the negation without a negative word of its own leads the "non": a
  // sentence adverb in a subordinate clause, "dice che il gatto forse non mangia" (P09-E39).
  const leadsNon = negAdverb?.slot === 'pre-negator' && negText === 'non' && !!modifierText;
  const negLead = leadsNon ? `${modifierText} ${negText}` : negText;
  const isFrequency = modifier?.forms['subtype'] === 'frequency' && !leadsNon;
  // The passive is periphrastic too — "è mangiato" is auxiliary + participio — so a frequency adverb
  // goes between the two ("è sempre mangiato"), not after the whole group.
  const periphrastic = passive || aspect === 'resultative' || aspect === 'progressive' || aspect === 'prospective';
  if (isFrequency && modifierText && periphrastic && modals.length === 0) {
    const [finite, ...rest] = verbText.split(' ');
    const withAdverb = [finite, modifierText, ...rest].join(' ');
    return elideCi([negText, leadingReflexive, objectClitic, impersonalClitic, withAdverb, directObjectText, complementsText].filter(Boolean).join(' '));
  }
  // A multiword lemma's noun, "bisogno" in avere bisogno (NEED, B62), sits where a participle does:
  // the frequency adverb splits the lemma instead of trailing the whole thing ("non ha MAI bisogno
  // del cibo", "ha SEMPRE bisogno"), exactly as the compound tense above splits "ha MAI avuto
  // bisogno" and as French writes "n'a jamais besoin" (A242). A modal chain splits it too, since
  // the adverb would otherwise land behind the noun there as well ("deve avere SEMPRE bisogno");
  // a periphrasis took the branch above, which splits it at its own auxiliary.
  const lemmaNoun = periphrastic ? '' : lemmaTail(plain);
  const [finiteHead, lemmaEnd] = splitLemmaTail(verbText, lemmaNoun);
  if (isFrequency && modifierText && lemmaEnd) {
    return elideCi([negText, leadingReflexive, objectClitic, impersonalClitic, finiteHead, modifierText, lemmaEnd, directObjectText, complementsText]
      .filter(Boolean).join(' '));
  }
  return elideCi([negLead, leadingReflexive, objectClitic, impersonalClitic, verbText, leadsNon ? '' : modifierText, directObjectText, complementsText]
    .filter(Boolean)
    .join(' '));
}
