import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { groupHasNegativeAdverb } from '../../functions/groupHasNegativeAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { modalChain } from '../../functions/modalChain.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { IT_REFLEXIVE, IT_SHORT_IMPERATIVE } from './it.consts.js';
import { alarmCryText } from './alarmCryText.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
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
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
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
  const passiveSi = subjectForms['generic'] === '1' && !!directObject && !objectPrep && !isPronounElement(directObject)
    && directObject.agreement['number'] === 'plural' && !directObject.conjuncts.every((np) => alarmCry(verb, np));
  const agreeForms = passiveSi ? { ...subjectForms, number: 'plural' } : subjectForms;
  const pn = moodPN(agreeForms);
  // A third-person object clitic sits ahead of an avere participle, which agrees with it: "l'ha
  // vista", "li ha visti", "la deve aver vista". With mi / ti / ci / vi the agreement is optional
  // and left out.
  const cliticObject = directObject && !objectPrep && isPronounElement(directObject) ? firstConjunct(directObject).head.forms : undefined;
  const agreeingObject = cliticObject?.['person'] === '3' ? cliticObject : passiveSi ? directObject!.agreement : undefined;
  // A state verb's past is the imperfect ("voleva", "aveva", "era"), not the perfective (A130).
  const finite = (m: ConceptForms) => moodForm('it', m, pn, mood) ?? statePastForm('it', m, pn, tense, mood) ?? conjugate(m.forms, agreeForms, tense);
  // A pronominal verb ("muoversi") is conjugated as its plain verb, and its clitic, agreeing with the
  // subject, is placed apart: before the finite verb and before essere in the compound tenses ("si
  // muove", "si è mosso", "si muovesse"), attached to the infinitive and the gerund ("deve muoversi",
  // "sta per muovermi", "sta muovendosi") and after an affirmative command ("muoviti"). Under the
  // impersonal si it is "ci" and climbs to the finite verb whatever follows: "ci si deve muovere".
  const plain = nonReflexiveVerb(verb);
  const reflexive = reflexiveClitic(verb.forms, agreeForms);
  const reflexiveLeads = subjectForms['generic'] === '1' || (modals.length === 0 && (aspect === 'neutral' || aspect === 'resultative'));
  const leadingReflexive = reflexiveLeads ? reflexive : '';
  const attachedReflexive = reflexiveLeads ? '' : reflexive;
  // A modal chain makes the outermost modal the finite verb; every inner modal takes its
  // apocopated infinitive ("voglio poter andare") and the main verb closes the chain as the
  // infinitive of its whole group. "non" is prepended below, exactly as for a plain verb.
  const verbText = modals.length > 0
    ? [
        // Italian adverbs are postverbal, so each modal's own adverb trails its verb ("non
        // voglio mai poter sempre andare"); the main verb's adverb is appended after the group.
        ...modalChain(modals, finite, (m) => ({ post: m.modifier?.forms['base'] })),
        verbGroupInfinitive(plain.forms, subjectForms, aspect, agreeingObject, attachedReflexive),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(plain)
      : aspectVerb(plain.forms, agreeForms, tense, aspect, mood, agreeingObject, attachedReflexive);
  // "mai" always requires "non": "io non bevo mai" even without verbNegative.
  // A "nessun" (no) direct object is post-verbal, so it triggers negative concord —
  // "non vede nessun ragazzo" — whereas a pre-verbal "nessun" subject does not.
  // A negative adverb (mai) anywhere in the group — main verb or any modal — forces "non".
  const modifierIsNegative = groupHasNegativeAdverb(verbPhrase);
  // Any "nessun" conjunct triggers the concord — "non vede nessun ragazzo e nessuna ragazza".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  // A postverbal negative word — a `no`-determined direct object OR complement ("in nessuna casa",
  // "a nessun mercato") — obliges the preverbal "non", the same concord as a negative object. But a
  // preverbal negative SUBJECT ("nessun gatto") already negates the clause and carries it, so the
  // "non" is suppressed then: "nessun gatto mangia nessun topo", not "… non mangia …".
  const subjectIsNegative = subjectForms['definiteness'] === 'no';
  const negText = (verbNegative || modifierIsNegative || objectIsNegative || hasNegativeComplement(complements)) && !subjectIsNegative ? 'non' : '';
  // A pronoun direct object is a proclitic before the finite verb ("il gatto mi vede"), not a
  // post-verbal noun ("vede l'io"). It renders in front of the verb in the indicative and enclitic
  // on the imperative ("guardami"); a noun object keeps the post-verbal slot.
  // An elided subject complement leaves its pro-form in the same slot (A121): the invariable "lo" for
  // a predicate ("il cane non lo è", "i cani lo sono"), "ci" for a place ("il cane non c'è").
  const elided = verbPhrase.elided;
  const objectClitic = cliticObject
    ? objectPronounForm(cliticObject)
    : elided ? (elided.type === 'predicative' ? 'lo' : 'ci') : '';
  // The locative "ci" elides before the e- forms of essere: "c'è", "c'era", "non c'è mai stato".
  const elideCi = (text: string): string => (elided?.type === 'locative' ? text.replace(/(^|\s)ci (?=[eè])/, "$1c'") : text);
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
  const directObjectText = directObject && !objectClitic ? coordinate(directObject, tonicOrNoun) : '';
  const adverbText = modifier ? (modifier.forms['base'] ?? '') : '';
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection ? '' : adverbText;
  const complementsText = [isDirection ? adverbText : '', complementsPhrase(complements, subjectForms, verb.conceptId, directObject?.agreement)]
    .filter(Boolean).join(' ');
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
    const inf = verb.forms['base'] ?? verbText;
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
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  const periphrastic = aspect === 'resultative' || aspect === 'progressive' || aspect === 'prospective';
  if (isFrequency && modifierText && periphrastic && modals.length === 0) {
    const [finite, ...rest] = verbText.split(' ');
    const withAdverb = [finite, modifierText, ...rest].join(' ');
    return elideCi([negText, leadingReflexive, objectClitic, impersonalClitic, withAdverb, directObjectText, complementsText].filter(Boolean).join(' '));
  }
  return elideCi([negText, leadingReflexive, objectClitic, impersonalClitic, verbText, modifierText, directObjectText, complementsText]
    .filter(Boolean)
    .join(' '));
}
