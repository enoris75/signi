import type { ComplementType } from '@signi/shared';
import { firstConjunct, groupHasNegativeAdverb, hasNegativeComplement, isPronounElement, objectPronounForm, type ResolvedComplement, type ResolvedNounElement, type ResolvedVerbPhrase } from '../../types.js';
import { imperativeForm, moodForm, moodPN } from '../../mood.js';
import { VOWEL_START } from './fr.consts.js';
import { aspectVerbFr } from './aspectVerbFr.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinate } from './coordinate.js';
import { frCliticize } from './frCliticize.js';
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
  let effectiveVerb: string;
  let effectiveMod: string;
  if (modals.length > 0) {
    // The outermost modal is the finite verb — it takes the tense, the agreement, and the
    // negation — and governs the inner modals' infinitives down to the main verb group's
    // ("je ne veux pas pouvoir aller", "il doit avoir vu le chat").
    const { finite, finiteAdverb, tail } = modalGroupFr(modals, verb.forms, subjectForms, tense, aspect, mood, isFrequency ? modifierText : '');
    effectiveVerb = [negateFinite(finite), finiteAdverb, tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency ? '' : modifierText;
  } else if (aspect !== 'neutral') {
    // Every non-neutral aspect is periphrastic on a finite auxiliary; negation (ne … pas, or
    // "ne" alone for the self-negating "aucun"/"jamais") wraps that auxiliary, then a
    // frequency adverb, then the non-finite tail ("n'a jamais été", "n'est pas en train
    // d'aller", "est allé", "n'a pas vu").
    const { finite, tail } = aspectVerbFr(verb.forms, subjectForms, tense, aspect, mood, precedingObjectForms);
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
  // A pronoun direct object is a proclitic before the finite verb ("le chat me voit"), not a
  // post-verbal noun ("voit le je"). It sits inside any "ne … pas" bracket ("ne me voit pas") and
  // elides me/te/le/la → m'/t'/l' before a vowel; a noun object keeps the post-verbal slot.
  const objectClitic = directObject && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  const directObjectText = directObject && !objectClitic ? coordinate(directObject, npText) : '';
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // Imperative: a subjectless command. The person picks the form (tu / nous / vous — the -er
  // "tu" dropping its final -s); a single paradigm serves both polarities, with negation wrapped
  // by `negateFinite` ("ne cours pas", "ne sois pas prudent", "aucun"/"jamais" taking bare "ne").
  if (mood === 'imperative') {
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in French ("Charger une période", "Ne pas courir"), not the imperative.
    if (register === 'instruction') {
      const inf = verb.forms['base'] ?? conjugated;
      const infVerb = verbNegative === true ? `ne pas ${inf}` : inf;
      return [frCliticize(objectClitic, infVerb), modifierText, directObjectText, complementsText]
        .filter(Boolean)
        .join(' ');
    }
    const impForm = imperativeForm('fr', verb, moodPN(subjectForms), false) ?? conjugated;
    return [frCliticize(objectClitic, negateFinite(impForm)), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consommer la nourriture"), the same surface
  // French already gives the imperative `instruction` register above. Negation brackets the whole
  // infinitive ("ne pas consommer"); an object pronoun is proclitic ("le consommer"), via frCliticize.
  if (mood === 'infinitive') {
    const inf = verb.forms['base'] ?? conjugated;
    const infVerb = verbNegative === true ? `ne pas ${inf}` : inf;
    return [frCliticize(objectClitic, infVerb), modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  return [frCliticize(objectClitic, effectiveVerb), effectiveMod, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
