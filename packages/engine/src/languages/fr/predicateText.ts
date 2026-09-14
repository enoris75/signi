import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { alarmCry } from '../../resolved/alarmCry.js';
import { firstConjunct } from '../../resolved/firstConjunct.js';
import { groupHasNegativeAdverb } from '../../resolved/groupHasNegativeAdverb.js';
import { groupObjectClitic } from '../../resolved/groupObjectClitic.js';
import { hasNegativeComplement } from '../../resolved/hasNegativeComplement.js';
import { isNegativeAdverb } from '../../resolved/isNegativeAdverb.js';
import { isPronounElement } from '../../resolved/isPronounElement.js';
import { objectPronounForm } from '../../resolved/objectPronounForm.js';
import { imperativeForm, moodForm, moodPN } from '../../mood.js';
import { VOWEL_START } from './fr.consts.js';
import { alarmCryText } from './alarmCryText.js';
import { aspectVerbFr } from './aspectVerbFr.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinate } from './coordinate.js';
import { frCliticize } from './frCliticize.js';
import { frEnclitic } from './frEnclitic.js';
import { modalGroupFr } from './modalGroupFr.js';
import { npText } from './npText.js';

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
  // Set when this is an object-relative clause: the antecedent's forms, which an avoir participle
  // agrees with (the accord du COD antéposé). Absent for a main clause / subject-relative.
  precedingObjectForms?: Record<string, string>,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite verb takes the conditionnel (apodosis, "courrait")
  // or imparfait (protasis, "mangeait") form; marked aspects keep their indicative auxiliary.
  const conjugated = moodForm('fr', verb, moodPN(subjectForms), mood) ?? conjugate(verb.forms, subjectForms, tense);
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative. A jamais on *any* verb
  // in the group (main or a modal) provides the negation, so "pas" is suppressed group-wide.
  const groupNegative = groupHasNegativeAdverb(verbPhrase);
  // A frequency adverb (jamais, toujours, souvent) sits right after the finite verb — which
  // in a compound tense means between the auxiliary and the participle ("n'a jamais été",
  // "doit toujours aller"), not trailing the whole group. Manner adverbs still trail.
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  // "aucun" (no) is itself the negator, so it takes "ne" alone (no "pas") — for a subject
  // ("aucun garçon ne pleure"), an object ("il ne voit aucun garçon"), or a postverbal complement
  // ("le chat ne court dans aucune maison"), which obliges the same preverbal "ne".
  const aucun =
    subjectForms['definiteness'] === 'no' ||
    (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false) ||
    hasNegativeComplement(complements);
  // Wrap a finite verb in "ne … pas" (or "ne" alone, when a self-negating "aucun"/"jamais"
  // already carries the negation). Shared by the periphrastic aspect and the modal chain,
  // which both negate their finite auxiliary and leave the non-finite tail untouched.
  const negateFinite = (finite: string): string => {
    if (!verbNegative && !aucun && !groupNegative) return finite;
    const ne = VOWEL_START.test(finite) ? "n'" : 'ne ';
    const pas = verbNegative && !groupNegative && !aucun ? ' pas' : '';
    return `${ne}${finite}${pas}`;
  };
  // A pronoun direct object is a proclitic before the finite verb ("le chat me voit"), not a
  // post-verbal noun ("voit le je"). It sits inside any "ne … pas" bracket ("ne me voit pas") and
  // elides me/te/le/la → m'/t'/l' before a vowel; a noun object keeps the post-verbal slot.
  //
  // French cannot coordinate clitics. A group holding a pronoun puts each pronoun in its tonic form
  // and resumes the whole group with its plural clitic, the group itself dislocated to the end of the
  // clause between commas ("le chat nous voit, lui et moi", "le chien qui nous voit, lui et moi,
  // court"), as the subject slot does ("moi et toi, nous"). The closing comma is tidied against the
  // full stop in `punctuate`. A group of nouns keeps the post-verbal slot, and so does one with an
  // "aucun" conjunct, which no clitic can resume.
  const dislocated = !!directObject && directObject.conjuncts.length > 1 && !aucun
    && directObject.conjuncts.some((np) => np.head.forms['person']);
  // An elided subject complement leaves its pro-form in the same slot (A121): the invariable "le" for
  // a predicate ("le chien ne l'est pas", "les chiens le sont"), "y" for a place ("il n'y est pas").
  const elided = verbPhrase.elided;
  const objectClitic = !directObject ? (elided ? (elided.type === 'predicative' ? 'le' : 'y') : '')
    : isPronounElement(directObject) ? objectPronounForm(firstConjunct(directObject).head.forms)
    : dislocated ? groupObjectClitic(directObject) : '';
  // The alarm a cry raises takes "à" and the article ("cria au loup", A124).
  const tonicOrNoun = (np: ResolvedNounPhrase) => {
    if (np.head.forms['person']) return np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '';
    const cry = alarmCry(verb, np);
    return cry ? alarmCryText(cry) : npText(np);
  };
  const objectGroup = directObject && (!objectClitic || dislocated) ? coordinate(directObject, tonicOrNoun) : '';
  const directObjectText = dislocated ? '' : objectGroup;
  const withDislocated = (clause: string) => (dislocated ? `${clause}, ${objectGroup},` : clause);
  // The clitic precedes the verb, so an avoir participle agrees with it as with any preceding direct
  // object ("le chat l'a vue", "les a vus"); a resumed group agrees as the group ("nous a vus, lui
  // et moi"). An object relative passes its antecedent instead (`precedingObjectForms`).
  // A pro-form is no object, and the participle does not agree with it ("l'a été").
  const cliticObjectForms = !objectClitic || !directObject ? undefined
    : dislocated ? directObject!.agreement : firstConjunct(directObject!).head.forms;
  // Modern French has no clitic climbing. Under a modal or the progressive / prospective the clitic
  // goes before the infinitive it belongs to ("doit me voir", "est en train de l'ajouter", "doit
  // l'avoir vu"); only the compound past keeps it on the finite auxiliary ("l'a vu").
  const infinitiveClitic = modals.length > 0 || aspect === 'progressive' || aspect === 'prospective' ? objectClitic : '';
  const finiteClitic = infinitiveClitic ? '' : objectClitic;
  let effectiveVerb: string;
  let effectiveMod: string;
  if (modals.length > 0) {
    // The outermost modal is the finite verb — it takes the tense, the agreement, and the
    // negation — and governs the inner modals' infinitives down to the main verb group's
    // ("je ne veux pas pouvoir aller", "il doit avoir vu le chat").
    const { finite, finiteAdverb, tail } = modalGroupFr(
      modals, verb.forms, subjectForms, tense, aspect, mood, isFrequency ? modifierText : '', infinitiveClitic, precedingObjectForms ?? cliticObjectForms,
    );
    effectiveVerb = [negateFinite(finite), finiteAdverb, tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency ? '' : modifierText;
  } else if (aspect !== 'neutral') {
    // Every non-neutral aspect is periphrastic on a finite auxiliary; negation (ne … pas, or
    // "ne" alone for the self-negating "aucun"/"jamais") wraps that auxiliary, then a
    // frequency adverb, then the non-finite tail ("n'a jamais été", "n'est pas en train
    // d'aller", "est allé", "n'a pas vu").
    const { finite, tail } = aspectVerbFr(verb.forms, subjectForms, tense, aspect, mood, precedingObjectForms ?? cliticObjectForms, infinitiveClitic);
    effectiveVerb = [negateFinite(finite), isFrequency ? modifierText : '', tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency ? '' : modifierText;
  } else if (verbNegative || aucun || groupNegative) {
    // Plain finite negation reuses `negateFinite`, which elides "ne" → "n'" before a vowel
    // ("il n'est pas prudent") and picks "ne … pas" vs bare "ne" (self-negating aucun/jamais).
    effectiveVerb = negateFinite(conjugated);
    effectiveMod = modifierText;
  } else {
    effectiveVerb = conjugated;
    effectiveMod = modifierText;
  }
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // A non-finite verb takes its whole negation in front, the clitic staying against the infinitive:
  // "ne pas le voir". A negative adverb is itself the negator ("ne jamais manger"), and an "aucun"
  // takes "ne" alone ("ne manger aucune souris"), as `negateFinite` has it; "ne" elides against the
  // word after it ("n'aimer aucun chat"). Shared by the instruction register and the infinitive mood.
  const negativeAdverb = isNegativeAdverb(modifier);
  const infinitiveMod = negativeAdverb ? '' : modifierText;
  const negateInfinitive = (inf: string): string => {
    const group = frCliticize(objectClitic, inf);
    if (!verbNegative && !aucun && !negativeAdverb) return group;
    const negator = negativeAdverb ? modifierText : verbNegative && !aucun ? 'pas' : '';
    const tail = [negator, group].filter(Boolean).join(' ');
    return `${VOWEL_START.test(tail) ? "n'" : 'ne '}${tail}`;
  };
  // Imperative: a subjectless command. The person picks the form (tu / nous / vous — the -er
  // "tu" dropping its final -s); a single paradigm serves both polarities, with negation wrapped
  // by `negateFinite` ("ne cours pas", "ne sois pas prudent", "aucun"/"jamais" taking bare "ne").
  if (mood === 'imperative') {
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in French ("Charger une période", "Ne pas courir"), not the imperative.
    if (register === 'instruction') {
      return withDislocated([negateInfinitive(verb.forms['base'] ?? conjugated), infinitiveMod, directObjectText, complementsText]
        .filter(Boolean)
        .join(' '));
    }
    const pn = moodPN(subjectForms);
    const impForm = imperativeForm('fr', verb, pn, false) ?? conjugated;
    // An affirmative command puts its pronouns after the verb ("vois-moi", "effondre-toi"); the
    // negative one keeps them in front, inside "ne … pas" ("ne me vois pas", "ne t'effondre pas").
    const affirmative = !verbNegative && !aucun && !groupNegative;
    const reflexive = /^(?:s'|se )/.test(verb.forms['base'] ?? '');
    const impVerb = affirmative
      ? frEnclitic(impForm, objectClitic, reflexive, pn)
      : frCliticize(objectClitic, negateFinite(impForm));
    return withDislocated([impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' '));
  }
  // Infinitive / citation phrase: the bare infinitive ("consommer la nourriture"), the same surface
  // French already gives the imperative `instruction` register above. Negation precedes the whole
  // infinitive ("ne pas consommer"); an object pronoun is proclitic ("le consommer"), via
  // `negateInfinitive`.
  if (mood === 'infinitive') {
    return withDislocated([negateInfinitive(verb.forms['base'] ?? conjugated), infinitiveMod, directObjectText, complementsText]
      .filter(Boolean)
      .join(' '));
  }
  return withDislocated([frCliticize(finiteClitic, effectiveVerb), effectiveMod, directObjectText, complementsText]
    .filter(Boolean)
    .join(' '));
}
