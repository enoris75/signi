import type { ComplementType } from '@signi/shared';
import { firstConjunct, groupHasNegativeAdverb, hasNegativeComplement, isPronounElement, modalChain, objectPronounForm, type ConceptForms, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase } from '../../types.js';
import { imperativeForm, moodForm, moodPN } from '../../mood.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinate } from './coordinate.js';
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
  // In a hypothetical conditional the finite element (the outermost modal, or the main verb)
  // takes the conditional (apodosis) or imperfect-subjunctive (protasis) form; the marked
  // aspects keep their indicative auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  // A third-person object clitic sits ahead of an avere participle, which agrees with it: "l'ha
  // vista", "li ha visti", "la deve aver vista". With mi / ti / ci / vi the agreement is optional
  // and left out.
  const cliticObject = directObject && isPronounElement(directObject) ? firstConjunct(directObject).head.forms : undefined;
  const agreeingObject = cliticObject?.['person'] === '3' ? cliticObject : undefined;
  const finite = (m: ConceptForms) => moodForm('it', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
  // A modal chain makes the outermost modal the finite verb; every inner modal takes its
  // apocopated infinitive ("voglio poter andare") and the main verb closes the chain as the
  // infinitive of its whole group. "non" is prepended below, exactly as for a plain verb.
  const verbText = modals.length > 0
    ? [
        // Italian adverbs are postverbal, so each modal's own adverb trails its verb ("non
        // voglio mai poter sempre andare"); the main verb's adverb is appended after the group.
        ...modalChain(modals, finite, (m) => ({ post: m.modifier?.forms['base'] })),
        verbGroupInfinitive(verb.forms, subjectForms, aspect, agreeingObject),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(verb)
      : aspectVerb(verb.forms, subjectForms, tense, aspect, mood, agreeingObject);
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
  const objectClitic = directObject && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes its tonic
  // form with no article ("vede il cane e te", "vede lui e me").
  const tonicOrNoun = (np: ResolvedNounPhrase) => np.head.forms['person'] ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '') : npText(np);
  // The impersonal "si" is a preverbal clitic standing in for a generic subject ("si mangia" —
  // "one eats"). It sits after any "non" and before the verb (and before an object clitic, in the
  // rare "non se lo …" order); the subject word itself is suppressed upstream.
  const impersonalClitic = subjectForms['generic'] === '1' ? (subjectForms['base'] ?? '') : '';
  const directObjectText = directObject && !objectClitic ? coordinate(directObject, tonicOrNoun) : '';
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // Imperative: a subjectless command. The subject pronoun's person picks the form (tu / noi /
  // voi); the negative changes it (non + infinito for tu, "non" + the affirmative form for
  // noi/voi). "non" already sits in negText, so reuse it as the negation flag and prefix.
  if (mood === 'imperative') {
    // Italian is the one Romance language whose UI labels keep the imperative ("Salva", "Carica"),
    // so an instruction only pins the person to tu — it has no addressee to take noi/voi from.
    const impPN = register === 'instruction' ? '2sg' : moodPN(subjectForms);
    const impForm = imperativeForm('it', verb, impPN, negText === 'non') ?? verbText;
    return [negText, impForm + objectClitic, modifierText, directObjectText, complementsText]
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
    const infWithClitic = objectClitic ? inf.replace(/e$/, '') + objectClitic : inf;
    return [negText, infWithClitic, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Italian slots a FREQUENCY adverb between the auxiliary and the past participle of a compound
  // perfect ("ha SEMPRE mangiato", "non ha MAI mangiato"), not after the whole group — where a
  // MANNER adverb does belong ("ha mangiato bene"). Only the resultative splits the verb into
  // auxiliary + participle; a simple tense ("mangia sempre") and a modal chain ("deve mangiare
  // sempre") keep the adverb after the verb, so both stay on the append path below.
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  if (isFrequency && modifierText && aspect === 'resultative' && modals.length === 0) {
    const [aux, ...rest] = verbText.split(' ');
    const withAdverb = [aux, modifierText, ...rest].join(' ');
    return [negText, impersonalClitic, objectClitic, withAdverb, directObjectText, complementsText].filter(Boolean).join(' ');
  }
  return [negText, impersonalClitic, objectClitic, verbText, modifierText, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
