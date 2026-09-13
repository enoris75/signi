import type { ComplementType } from '@signi/shared';
import { firstConjunct, groupHasNegativeAdverb, groupObjectClitic, hasNegativeComplement, isPronounElement, modalChain, objectPronounForm, type ConceptForms, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase } from '../../types.js';
import { imperativeForm, moodForm, moodPN } from '../../mood.js';
import { ESTAR_COPULA } from './es.consts.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinateElement } from './coordinateElement.js';
import { esCliticize } from './esCliticize.js';
import { npText } from './npText.js';
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
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correría")
  // or imperfect-subjunctive (protasis, "comiera") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  const finite = (m: ConceptForms) => moodForm('es', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
  // A47: Spanish splits the copula. `estar` covers two BE frames; `ser` everything else.
  //  · Location — "el gato está en la casa", never "*es en la casa". A place is `estar`
  //    unconditionally, whatever the spatial relation, so a locative alone selects it; the past
  //    inherits the choice as the preterite ("estuvo"). But a locative alongside a predicate
  //    nominal ("es una leyenda en la casa") is a mere adjunct — the predicative decides the copula
  //    there — so estar fires for a locative only when it is the sole predication.
  //  · A transient predicate adjective — "está cansado", not "*es cansado". Inherent adjectives
  //    ("es grande") and predicate nouns ("es una leyenda") keep `ser`; the corpus marks which
  //    adjectives are transient (`forms['transient']`), read off the first conjunct.
  const predicativeHead = complements?.predicative
    ? firstConjunct(complements.predicative.phrase).head.forms : undefined;
  const transientPredicative =
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1';
  const locativeAlone = !!complements?.locative && !complements?.predicative;
  const copulaVerb =
    verb.conceptId === 'BE' && (locativeAlone || transientPredicative) ? ESTAR_COPULA : verb;
  // A modal chain makes the outermost modal the finite verb ("quiero poder ir"); "no" is
  // prepended below and lands in front of it, exactly as for a plain verb.
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
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
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: m.modifier?.forms['base'] })),
        verbGroupInfinitive(verb.forms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(copulaVerb)
      : aspectVerb(verb.forms, subjectForms, tense, aspect, mood);
  // A "ninguno" (no) direct object is post-verbal, so it triggers negative concord —
  // "no veo ningún niño" — whereas a pre-verbal "ningún" subject does not.
  // Any "ningún" conjunct triggers the concord — "no veo ningún niño ni ninguna niña".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  // The preverbal "no" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("ningún gato …") or a preverbal "nunca" (the finite adverb,
  // preverbal when the verb isn't itself negated) already negates the clause, so "no" is dropped.
  const subjectIsNegative = subjectForms['definiteness'] === 'no';
  const needsNo = verbNegative || objectIsNegative || hasNegativeComplement(complements) || groupHasNegativeAdverb(verbPhrase);
  const verbText = needsNo && !subjectIsNegative && !preVerbNunca ? `no ${conjugated}` : conjugated;
  // A pronoun direct object is a proclitic before the finite verb ("el gato me ve"), sitting after
  // "no" in the negative ("no me ve"), not a post-verbal noun ("ve el yo"). A noun object keeps the
  // post-verbal slot.
  const pronounGroup = !!directObject && directObject.conjuncts.length > 1
    && directObject.conjuncts.every((np) => np.head.forms['person']);
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes "a" + its
  // tonic form. A group of pronouns is doubled by its plural clitic ("el gato nos ve a mí y a ti");
  // a group mixing in a noun, where the doubling is optional, is left undoubled.
  const objectClitic = !directObject ? ''
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : pronounGroup ? groupObjectClitic(directObject) : '';
  const tonicOrNoun = (np: ResolvedNounPhrase) => np.head.forms['person'] ? `a ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}` : npText(np);
  // The impersonal "se" is a preverbal clitic standing in for a generic subject ("se come" — "one
  // eats"); the subject word is suppressed upstream. It leads any object clitic ("se lo come").
  const impersonalClitic = subjectForms['generic'] === '1' ? (subjectForms['base'] ?? '') : '';
  const proclitics = [impersonalClitic, objectClitic].filter(Boolean).join(' ');
  const directObjectText = directObject && (!objectClitic || pronounGroup) ? coordinateElement(directObject, tonicOrNoun) : '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  const preVerb = preVerbNunca ? (groupAdverbs[frontIdx]?.forms['base'] ?? '') : '';
  const mainIsFronted = frontIdx === modals.length;
  const postVerb = mainIsFronted ? '' : modifierText;
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // Imperative: a subjectless command. The person picks the form (tú = 3sg-present, nosotros /
  // every negative = present subjunctive, vosotros = infinitive − r + d); a negative command
  // ("no comas", "no seáis") prefixes "no". The adverb simply trails the verb here.
  if (mood === 'imperative') {
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Spanish ("Cargar un período", "No correr"), not the imperative.
    const impForm = register === 'instruction'
      ? (verb.forms['base'] ?? conjugated)
      : (imperativeForm('es', verb, moodPN(subjectForms), impNeg) ?? conjugated);
    const impVerb = impNeg ? `no ${impForm}` : impForm;
    return [esCliticize(objectClitic, impVerb), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir el alimento"), the same surface
  // Spanish already gives the imperative `instruction` register above. Negation prefixes "no" ("no
  // consumir"); an object pronoun attaches enclitically ("consumirlo"), via esCliticize.
  if (mood === 'infinitive') {
    const inf = verb.forms['base'] ?? conjugated;
    const infNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    const infVerb = infNeg ? `no ${inf}` : inf;
    return [esCliticize(objectClitic, infVerb), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [preVerb, esCliticize(proclitics, verbText), postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
