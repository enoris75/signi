import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { groupHasNegativeAdverb } from '../../functions/groupHasNegativeAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { modalChain } from '../../functions/modalChain.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { imperativeForm, moodForm, moodPN } from '../../mood.js';
import { ESTAR_COPULA } from './pt.consts.js';
import { aspectVerb } from './aspectVerb.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { coordinateElement } from './coordinateElement.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { npText } from './npText.js';
import { ptCliticize } from './ptCliticize.js';
import { ptEnclitic } from './ptEnclitic.js';
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
  // Set when nothing is rendered ahead of the predicate: a main clause whose pronoun subject was
  // dropped (see `renderClause`). A 3rd-person clitic cannot open the clause, so it follows the verb.
  verbLeads = false,
): string {
  const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite element takes the conditional (apodosis, "correria")
  // or imperfect-subjunctive (protasis, "comesse") form; marked aspects keep their indicative
  // auxiliary (aspect under a conditional is a documented gap).
  const pn = moodPN(subjectForms);
  const finite = (m: ConceptForms) => moodForm('pt', m, pn, mood) ?? conjugate(m.forms, subjectForms, tense);
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
    predicativeHead?.['role'] === 'adjective' && predicativeHead['transient'] === '1';
  const locativeAlone = !!locative && !predicative;
  // Every form of the verb below reads the choice, not only the finite one: "deve estar", "tinha
  // estado", "esteja", "estar na casa".
  const copulaVerb =
    verb.conceptId === 'BE' && (locativeAlone || transientPredicative) ? ESTAR_COPULA : verb;
  // A modal chain makes the outermost modal the finite verb ("quero poder ir"); "não" is
  // prepended below and lands in front of it, exactly as for a plain verb.
  const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
  const modifierIsNegative = modifier?.forms['polarity'] === 'negative';
  // Portuguese fronts one negative frequency adverb ("nunca") preverbally without "não", whichever
  // verb it modifies. Scan the group outermost-first (each modal, then the main verb); the first
  // negative adverb takes that slot. `frontIdx` indexes this array: 0…n-1 modals, n = main verb.
  const groupAdverbs = [...modals.map((m) => m.modifier), modifier];
  const frontIdx = verbNegative ? -1 : groupAdverbs.findIndex((a) => a?.forms['polarity'] === 'negative');
  const preVerbNunca = frontIdx >= 0;
  const conjugated = modals.length > 0
    ? [
        // Each modal's adverb trails its verb ("não quer nunca poder ir"), except the fronted
        // negative adverb, which takes the preverbal slot instead (emitted as preVerb).
        ...modalChain(modals, finite, (m, i) => (i === frontIdx ? {} : { post: m.modifier?.forms['base'] })),
        verbGroupInfinitive(copulaVerb.forms, aspect),
      ].join(' ')
    : aspect === 'neutral'
      ? finite(copulaVerb)
      : aspectVerb(copulaVerb.forms, subjectForms, tense, aspect, mood);
  // A "nenhum" (no) direct object is post-verbal, so it triggers negative concord —
  // "não vê nenhum menino" — whereas a pre-verbal "nenhum" subject does not.
  // Any "nenhum" conjunct triggers the concord — "não vê nenhum menino e nenhuma menina".
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  // The preverbal "não" is emitted only when the clause needs a preverbal negator AND none is already
  // there. A preverbal negative subject ("nenhum gato …") or a preverbal "nunca" (the finite adverb)
  // already negates the clause, so "não" is dropped.
  const subjectIsNegative = subjectForms['definiteness'] === 'no';
  const needsNao = verbNegative || objectIsNegative || hasNegativeComplement(complements) || groupHasNegativeAdverb(verbPhrase);
  const verbText = needsNao && !subjectIsNegative && !preVerbNunca ? `não ${conjugated}` : conjugated;
  // A pronoun direct object is a proclitic before the finite verb — the Brazilian order "o gato me
  // vê", after "não" in the negative ("não me vê") — not a post-verbal noun ("vê o eu"). A noun
  // object keeps the post-verbal slot.
  const objectClitic = directObject && isPronounElement(directObject)
    ? objectPronounForm(firstConjunct(directObject).head.forms) : '';
  // A coordination cannot be a clitic: it stays post-verbal, and a pronoun conjunct takes the
  // normative tonic object, "a" + its tonic form ("vê a ele e a mim", "vê o cão e a você").
  const tonicOrNoun = (np: ResolvedNounPhrase) => np.head.forms['person'] ? `a ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}` : npText(np);
  // The impersonal "se" is a preverbal clitic standing in for a generic subject ("se come" — "one
  // eats"); the subject word is suppressed upstream. It leads any object clitic ("se o come").
  const impersonalClitic = subjectForms['generic'] === '1' ? (subjectForms['base'] ?? '') : '';
  const proclitics = [impersonalClitic, objectClitic].filter(Boolean).join(' ');
  // A 3rd-person o / a / os / as cannot open a clause in either norm, so wherever nothing precedes
  // the verb it follows it, hyphenated (`ptEnclitic`): an affirmative command ("veja-o"), an
  // instruction or infinitive ("vê-lo"), and a clause whose subject was dropped ("vejo-o"). Me / te /
  // nos lead a clause colloquially and stay in front ("me veja").
  const thirdPersonClitic = !!objectClitic && firstConjunct(directObject!).head.forms['person'] === '3' ? objectClitic : '';
  const directObjectText = directObject && !objectClitic ? coordinateElement(directObject, tonicOrNoun) : '';
  // The fronted "nunca" is emitted preverbally; the main verb's own adverb trails the verb unless
  // it *is* the fronted one (frontIdx points past the last modal, at the main verb).
  const preVerb = preVerbNunca ? (groupAdverbs[frontIdx]?.forms['base'] ?? '') : '';
  const mainIsFronted = frontIdx === modals.length;
  const postVerb = mainIsFronted ? '' : modifierText;
  const complementsText = complementsPhrase(complements, subjectForms, verb.conceptId);
  // Imperative: a subjectless command. The person picks the form (tu = 3sg-present, nós / every
  // negative = present subjunctive, vós = 2pl-present − s); a negative command ("não comas")
  // prefixes "não". The adverb simply trails the verb here.
  if (mood === 'imperative') {
    const impNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in Portuguese ("Carregar um período", "Não correr"), not the imperative.
    // A pronominal command is derived from the plain verb and takes the addressee's reflexive — "se"
    // for você / vocês, "nos" for nós — after an affirmative command ("torne-se", "tornemo-nos", the
    // -s dropping) and before a negative one ("não se torne"). The instruction keeps "tornar-se".
    const impPN = moodPN(subjectForms);
    const reflexive = register !== 'instruction' && (copulaVerb.forms['base'] ?? '').endsWith('-se')
      ? (impPN === '1pl' ? 'nos' : 'se') : '';
    const impForm = register === 'instruction'
      ? (copulaVerb.forms['base'] ?? conjugated)
      : (imperativeForm('pt', nonReflexiveVerb(copulaVerb), impPN, impNeg) ?? conjugated);
    const impVerb = reflexive
      ? (impNeg ? `não ${reflexive} ${impForm}` : `${reflexive === 'nos' ? impForm.replace(/s$/, '') : impForm}-${reflexive}`)
      : !impNeg && thirdPersonClitic
        ? ptEnclitic(impForm, thirdPersonClitic)
        : ptCliticize(objectClitic, impNeg ? `não ${impForm}` : impForm);
    return [impVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // Infinitive / citation phrase: the bare infinitive ("consumir o alimento"), the same surface
  // Portuguese already gives the imperative `instruction` register above. Negation prefixes "não"
  // ("não consumir"); a 3rd-person object pronoun attaches after it ("consumi-lo"), and after "não"
  // it leads ("não o consumir").
  if (mood === 'infinitive') {
    const inf = copulaVerb.forms['base'] ?? conjugated;
    const infNeg = verbNegative === true || objectIsNegative || modifierIsNegative;
    const infVerb = !infNeg && thirdPersonClitic
      ? ptEnclitic(inf, thirdPersonClitic)
      : ptCliticize(objectClitic, infNeg ? `não ${inf}` : inf);
    return [infVerb, modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' ');
  }
  // With nothing ahead of the verb, the clitic follows the last verb of the group that can carry it:
  // the finite verb ("vejo-o", "tinha-o visto") or a modal's infinitive ("posso vê-lo"), never a
  // participle. A synthetic future or conditional would split for it ("vê-lo-ei"); that mesoclisis
  // is not modelled, so those keep the clitic in front.
  const verbFirst = verbLeads && !preVerb && !impersonalClitic && !verbText.startsWith('não ')
    && (modals.length > 0 || aspect !== 'neutral' || (tense !== 'future' && mood !== 'conditional'));
  const participle = copulaVerb.forms['participle'];
  const verbWords = verbText.split(' ');
  const host = verbWords.map((w, i) => (w !== participle ? i : -1)).filter((i) => i >= 0).pop() ?? verbWords.length - 1;
  const cliticizedVerb = verbFirst && thirdPersonClitic
    ? verbWords.map((w, i) => (i === host ? ptEnclitic(w, thirdPersonClitic) : w)).join(' ')
    : ptCliticize(proclitics, verbText);
  return [preVerb, cliticizedVerb, postVerb, directObjectText, complementsText]
    .filter(Boolean)
    .join(' ');
}
