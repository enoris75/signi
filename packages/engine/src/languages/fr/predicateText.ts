import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedNounPhrase, ResolvedVerbPhrase } from '../../types.js';
import { alarmCry } from '../../functions/alarmCry.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { complementsAroundAdverb } from '../../functions/complementsAroundAdverb.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { groupObjectClitic } from '../../functions/groupObjectClitic.js';
import { dativePronounForm } from '../../functions/dativePronounForm.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { isNegativeAdverb } from '../../functions/isNegativeAdverb.js';
import { isPronounElement } from '../../functions/isPronounElement.js';
import { lemmaTail } from '../../functions/lemmaTail.js';
import { negativeAdverb as negativeAdverbForm } from '../../functions/negativeAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';
import { splitLemmaTail } from '../../functions/splitLemmaTail.js';
import { imperativeForm, moodForm, moodPN, statePastForm } from '../../mood.js';
import { agentPhrase } from './agentPhrase.js';
import { agreeParticipleFr } from './agreeParticipleFr.js';
import { alarmCryText } from './alarmCryText.js';
import { aspectVerbFr } from './aspectVerbFr.js';
import { complementsPhrase } from './complementsPhrase.js';
import { conjugate } from './conjugate.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './fr.consts.js';
import { coordinate } from './coordinate.js';
import { elidesBeforeVerb } from './elidesBeforeVerb.js';
import { frCliticize } from './frCliticize.js';
import { frEnclitic } from './frEnclitic.js';
import { modalGroupFr } from './modalGroupFr.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { objectNpText } from './objectNpText.js';
import { prepObjectText } from './prepObjectText.js';
import { reflexiveFinite } from './reflexiveFinite.js';

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
  // The demoted agent of a passive clause, rendered as the "par" phrase (see ResolvedPhrase.agent).
  agent?: ResolvedNounElement,
  // Whether the clause's own subject is a preverbal `no` phrase ("aucun chat"), which already negates
  // the clause. The caller's, as in English and German (see `negationSources`): a subject relative is
  // handed its head's forms for agreement, but a `no` head negates the MATRIX clause, not the relative
  // one (A167). It defaults to the forms' own `no`, which is right wherever they are the subject's.
  subjectIsNegative = subjectForms['definiteness'] === 'no',
): string {
  const { verb, negative: verbNegative, governedNegative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  // In a hypothetical conditional the finite verb takes the conditionnel (apodosis, "courrait")
  // or imparfait (protasis, "mangeait") form; marked aspects keep their indicative auxiliary.
  // A state verb's past is the imparfait ("avait", "était"), not the passé simple (A130).
  // A pronominal verb's stored forms carry a fixed clitic ("m'effondrerai", "nous effondrons"), so these
  // are derived from the plain verb and take the subject's clitic: "s'effondrerait", "nous effondrerions" (A137).
  //
  // The passive conjugates "être" where the active conjugates the lexical verb, and hangs that
  // verb's participe off it, agreeing with the promoted patient — now this clause's subject — as a
  // French passive participle always does ("la nourriture est mangée"). Every branch below builds
  // its group out of `finiteVerb`, so the composition follows: "a été mangée" (the compound past of
  // être), "est en train d'être mangée", "doit être mangée", "serait mangée". A passive is never
  // reflexive, whatever the lexical verb is.
  const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
  const finiteVerb = passive ? verbPhrase.passiveAux! : verb;
  const passiveParticipleText = passive
    ? agreeParticipleFr(passiveParticiple(verb), subjectForms)
    : '';
  const plain = passive ? finiteVerb : nonReflexiveVerb(verb);
  const moodFinite = moodForm('fr', plain, moodPN(subjectForms), mood) ?? statePastForm('fr', plain, moodPN(subjectForms), tense, mood);
  const conjugated = moodFinite !== undefined ? reflexiveFinite(finiteVerb.forms, subjectForms, moodFinite)
    : conjugate(finiteVerb.forms, subjectForms, tense);
  // A focus adverb that scopes over the negation. French changes both the word and the place: the
  // additive is *non plus* behind "pas", where *aussi* is ungrammatical, and STILL is *toujours* in
  // front of it — *ne … pas encore* is "not yet", the reading the plan does not mean (A244, A245).
  // A negation a modal governs denies the main verb's group, its adverb with it: "le chat peut ne pas
  // encore manger", "peut ne toujours pas manger" (P09-E28 follow-up). There the pre-negator word
  // goes in front of the governed "pas" (see `governedNegator`).
  const governedOnly = verbNegative !== true && governedNegative === true && modals.length > 0;
  const negAdverb = negativeAdverbForm(modifier, verbNegative === true || governedOnly);
  const preNegator = negAdverb?.slot === 'pre-negator' && !governedOnly ? negAdverb.text : '';
  const governedPreNegator = negAdverb?.slot === 'pre-negator' && governedOnly ? negAdverb.text : '';
  const adverbText = preNegator || governedPreNegator ? '' : (negAdverb?.text ?? (modifier ? (modifier.forms['base'] ?? '') : ''));
  // A direction adverb (UP, DOWN) says where the object ends up, so it follows a noun object the way
  // a direction complement does, instead of taking the manner adverb's slot between the verb and the
  // object — where it reads as a preposition on the object ("sposta su il libro" is "move onto the
  // book"). Leading the complements slot puts it there in every branch below (A142). An adverb of
  // place (PARTOUT) leaves the manner slot too, but stands among the complements where a locative
  // does, not at their head (A189).
  const isDirection = isDirectionAdverb(modifier);
  const modifierText = isDirection || isPlaceAdverb(modifier) ? '' : adverbText;
  // "jamais" uses ne...jamais (replaces "pas"), even without verbNegative. A jamais on a MODAL, or
  // on the main verb of a modal-free clause, provides the FINITE verb's negation, so "pas" is
  // suppressed there. One on the main verb under a modal denies the governed group instead (A236).
  const groupNegative = finiteHasNegativeAdverb(verbPhrase);
  // A frequency adverb (jamais, toujours, souvent) sits right after the finite verb — which
  // in a compound tense means between the auxiliary and the participle ("n'a jamais été",
  // "doit toujours aller"), not trailing the whole group. Manner adverbs still trail.
  const isFrequency = modifier?.forms['subtype'] === 'frequency';
  // A short adverb — "bien", and later "mal" / "mieux" / "trop" — goes BEFORE the non-finite verb it
  // modifies: between the auxiliary and the participle ("a bien mangé"), ahead of the infinitive a
  // modal governs ("doit bien manger"), and inside a periphrasis's "de" ("en train de bien manger").
  // A long -ment adverb follows it ("a mangé lentement"). After a FINITE verb it is already in place
  // ("mange bien la souris"), so the class only matters where a non-finite verb is built (A155).
  const preInfinitive = modifier?.forms['pre_nonfinite'] === '1' ? modifierText : '';
  // In a passive the verb it modifies is the participle, so it goes there ("est bien mangée", "a été
  // bien mangée", "doit être bien mangée"), not before "être" / "été", where "bien" is the assertive
  // "indeed" (A294). The auxiliary groups below take none of their own.
  const auxiliaryPreInfinitive = passive ? '' : preInfinitive;
  // "aucun" (no) is itself the negator, so it takes "ne" alone (no "pas") — for a subject
  // ("aucun garçon ne pleure"), an object ("il ne voit aucun garçon"), or a postverbal complement
  // ("le chat ne court dans aucune maison"), which obliges the same preverbal "ne" — and for an
  // "aucun" possessor in either of the last two ("ne voit la maison d'aucun homme", A216).
  // A postverbal "aucun" is told apart from a subject one below: only the postverbal kind can
  // concord with a negator standing *inside* the group a modal governs.
  const aucunPostverbal =
    (directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false) ||
    hasNegativeComplement(complements) || hasNegativePossessorComplement(complements);
  const aucun = subjectIsNegative || aucunPostverbal;
  // The main verb's own negation, which only a modal can govern: "je veux ne pas aller". Without a
  // modal the main verb IS the finite verb and `verbNegative` already carries it. Its negative
  // adverb is a negation of the same group, and is its own negator word: "le chat veut ne jamais
  // manger", where "jamais" replaces the "pas" exactly as it does on a finite verb (A236).
  const governedAdverb = governedHasNegativeAdverb(verbPhrase);
  const governedNeg = (governedNegative === true || governedAdverb) && modals.length > 0;
  const governedNegator = governedAdverb ? modifierText : governedPreNegator ? `${governedPreNegator} pas` : 'pas';
  // An inner modal denying itself ("je dois ne pas pouvoir aller"); the outermost modal's own
  // negation is the clause's, and lives in `verbNegative`.
  const innerNeg = modals.some((m, i) => i > 0 && m.negative === true);
  // A negator inside the governed group stands ahead of the object and the complements, so a
  // postverbal "aucun" concords with THAT one and the finite verb takes none: "le chat veut ne
  // manger aucune nourriture", not "… ne veut pas ne manger aucune nourriture", which would deny
  // the modal as well. The deepest negator is the nearest one, so the main verb's outranks an
  // inner modal's. A subject "aucun" is preverbal and keeps its "ne" on the finite verb either way
  // ("aucun chat ne veut ne pas manger").
  const concordedInside = governedNeg || innerNeg;
  const finiteAucun = subjectIsNegative || (aucunPostverbal && !concordedInside);
  // A multiword lemma's noun, "besoin" in avoir besoin (NEED, B62). Every finite form carries it ("a
  // besoin"), and what goes between a finite verb and a non-finite one goes between the verb and its
  // noun: the "pas" of the negation, and a frequency or short adverb ("n'a jamais eu", "a bien
  // mangé") — "n'a pas besoin", "n'a jamais besoin", "a toujours besoin", not "n'a besoin pas".
  // Empty for any other verb. `innerAdverb` is the adverb a finite takes inside: none unless it ends
  // in the noun, so an auxiliary or a modal in front of the lemma ("a eu besoin", "doit") is untouched.
  const lemmaNoun = lemmaTail(verb);
  const innerAdverb = (finite: string): string =>
    splitLemmaTail(finite, lemmaNoun)[1] && (isFrequency || preInfinitive) ? modifierText : '';
  // Wrap a finite verb in "ne … pas" (or "ne" alone, when a self-negating "aucun"/"jamais"
  // already carries the negation). Shared by the periphrastic aspect and the modal chain,
  // which both negate their finite auxiliary and leave the non-finite tail untouched. A
  // multiword finite is wrapped on its verb, then its inner adverb, then its noun; an affirmative
  // one comes back with its inner adverb in place ("a toujours besoin"), any other as it is.
  const negateFinite = (finite: string): string => {
    // The lemma's noun stays behind whatever the negation and the adverb put after the verb.
    const [head, noun] = splitLemmaTail(finite, lemmaNoun);
    const join = (verbPart: string) => [verbPart, innerAdverb(finite), noun].filter(Boolean).join(' ');
    if (!verbNegative && !finiteAucun && !groupNegative) return join(head);
    const ne = elidesBeforeVerb(verb.forms, head) ? "n'" : 'ne ';
    const pas = verbNegative && !groupNegative && !finiteAucun ? ' pas' : '';
    return join(`${ne}${head}${preNegator ? ` ${preNegator}` : ''}${pas}`);
  };
  // A NON-FINITE element takes its whole negation in front of it — "ne pas" stays together before
  // an infinitive, its auxiliary and its clitic ("ne pas avoir mangé", "ne pas me voir"), where a
  // finite verb would split it. "ne" elides against whatever follows ("n'aimer aucun chat"), which
  // is why the text is judged after the second word is chosen. Shared by the citation infinitive
  // and by every element a modal governs.
  const negateNonFinite = (negator: string, group: string): string => {
    const tail = [negator, group].filter(Boolean).join(' ');
    return `${elidesBeforeVerb(verb.forms, tail) ? "n'" : 'ne '}${tail}`;
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
  // A verb that takes its object with a preposition ("clique sur le bouton", A139) has no direct object
  // for a clitic to stand in for: its pronoun takes the tonic form after the preposition ("clique sur
  // moi"), and no participle agrees with it. The dative "à" is the exception (téléphoner à): its
  // pronoun object is the indirect-object clitic, "lui téléphone", where "téléphone à lui" is
  // ungrammatical (A240). No participle agrees with that one either.
  const objectPrep = objectPreposition(verb);
  const datClitic = objectPrep === 'à';
  const dislocated = !!directObject && !objectPrep && directObject.conjuncts.length > 1 && !aucun && !verbPhrase.existential
    && directObject.conjuncts.some((np) => np.head.forms['person']);
  // An elided subject complement leaves its pro-form in the same slot (A121): the invariable "le" for
  // a predicate ("le chien ne l'est pas", "les chiens le sont"), "y" for a place ("il n'y est pas").
  const elided = verbPhrase.elided;
  // An existential is "il y a": the "y" takes the object clitic's slot, and every placement that slot
  // has holds for it — inside "ne … pas" ("il n'y a pas de chat"), on the compound past's auxiliary
  // ("il y a eu"), before a modal's infinitive ("il peut y avoir"). The pivot is still the object
  // noun after the verb, where it takes a negation's "de" (P09-E6 D5).
  const existential = verbPhrase.existential === true;
  const objectClitic = existential ? 'y'
    : !directObject ? (elided ? (elided.type === 'predicative' ? 'le' : 'y') : '')
    : objectPrep && !datClitic ? ''
    : isPronounElement(directObject)
      ? (datClitic ? dativePronounForm(firstConjunct(directObject).head.forms) : objectPronounForm(firstConjunct(directObject).head.forms))
    : objectPrep ? ''
    : dislocated ? groupObjectClitic(directObject) : '';
  // The alarm a cry raises takes "à" and the article ("cria au loup", A124).
  // A noun object has no zero article, and a negation turns its indefinite or partitive article into
  // "de" ("ne mange pas de souris", A149); an object taken with a preposition is no direct object.
  // A negator governing the main verb stands ahead of its object too, so it turns an indefinite or
  // partitive article into "de" as the finite one does: "doit ne pas manger de souris".
  const negatedClause = verbNegative === true || groupNegative || aucun || governedNeg;
  const tonicOrNoun = (np: ResolvedNounPhrase) => {
    if (objectPrep) return prepObjectText(np, objectPrep);
    if (np.head.forms['person']) return np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '';
    const cry = alarmCry(verb, np);
    return cry ? alarmCryText(cry) : objectNpText(np, negatedClause);
  };
  // A focus particle singles the object out, from outside the phrase: "mange seulement la
  // nourriture", "mange la nourriture aussi" (C39).
  const objectGroup = directObject && (!objectClitic || dislocated || existential)
    ? withFocus(coordinate(directObject, tonicOrNoun), slotFocus(directObject), FOCUS_WORDS) : '';
  // A passive has no direct object left — the patient is this clause's subject now — so the slot
  // after the verb carries the by-phrase instead ("est mangée par le chat dans la maison").
  const directObjectText = passive ? agentPhrase(agent) : dislocated ? '' : objectGroup;
  const withDislocated = (clause: string) => (dislocated ? `${clause}, ${objectGroup},` : clause);
  // The clitic precedes the verb, so an avoir participle agrees with it as with any preceding direct
  // object ("le chat l'a vue", "les a vus"); a resumed group agrees as the group ("nous a vus, lui
  // et moi"). An object relative passes its antecedent instead (`precedingObjectForms`).
  // A pro-form is no object, and the participle does not agree with it ("l'a été").
  const cliticObjectForms = !objectClitic || !directObject || datClitic || existential ? undefined
    : dislocated ? directObject!.agreement : firstConjunct(directObject!).head.forms;
  // Modern French has no clitic climbing. Under a modal or the progressive / prospective the clitic
  // goes before the infinitive it belongs to ("doit me voir", "est en train de l'ajouter", "doit
  // l'avoir vu"); only the compound past keeps it on the finite auxiliary ("l'a vu").
  const infinitiveClitic = modals.length > 0 || aspect === 'progressive' || aspect === 'prospective' ? objectClitic : '';
  const finiteClitic = infinitiveClitic ? '' : objectClitic;
  let effectiveVerb: string;
  let effectiveMod: string;
  if (modals.length > 0) {
    // The outermost modal is the finite verb — it takes the tense, the agreement, and its own
    // negation — and governs the inner modals' infinitives down to the main verb group's
    // ("je ne veux pas pouvoir aller", "il doit avoir vu le chat"). Each governed element denies
    // itself with a "ne pas" of its own, in front of the group it denies: "je dois ne pas pouvoir
    // ne pas aller". The one that a postverbal "aucun" concords with drops the "pas", exactly as
    // the finite verb does ("le chat veut ne manger aucune nourriture").
    const concordDrops = aucunPostverbal;
    // The main verb's negative adverb is that verb's negator, written inside the group the modal
    // governs ("le chat veut ne jamais manger"); it is `governedNegator` above, so it takes no slot
    // of its own here. Any other frequency adverb belongs to the main verb and goes under its
    // negation ("je dois ne pas toujours aller").
    const { finite, finiteAdverb, tail } = modalGroupFr(
      modals, finiteVerb.forms, subjectForms, tense, aspect, mood, isFrequency && !governedAdverb ? modifierText : '', infinitiveClitic,
      precedingObjectForms ?? cliticObjectForms, auxiliaryPreInfinitive,
      (word) => negateNonFinite(concordDrops && !governedNeg ? '' : governedNegator, word),
      governedNeg ? (group) => negateNonFinite(concordDrops ? '' : governedNegator, group) : undefined,
    );
    effectiveVerb = [negateFinite(finite), finiteAdverb, tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency || preInfinitive || governedAdverb ? '' : modifierText;
  } else if (aspect !== 'neutral') {
    // Every non-neutral aspect is periphrastic on a finite auxiliary; negation (ne … pas, or
    // "ne" alone for the self-negating "aucun"/"jamais") wraps that auxiliary, then a
    // frequency adverb, then the non-finite tail ("n'a jamais été", "n'est pas en train
    // d'aller", "est allé", "n'a pas vu").
    const { finite, tail } = aspectVerbFr(
      finiteVerb.forms, subjectForms, tense, aspect, mood, precedingObjectForms ?? cliticObjectForms, infinitiveClitic, auxiliaryPreInfinitive,
    );
    effectiveVerb = [negateFinite(finite), isFrequency ? modifierText : '', tail].filter(Boolean).join(' ');
    effectiveMod = isFrequency || preInfinitive ? '' : modifierText;
  } else {
    // Plain finite negation reuses `negateFinite`, which elides "ne" → "n'" before a vowel
    // ("il n'est pas prudent") and picks "ne … pas" vs bare "ne" (self-negating aucun/jamais). An
    // affirmative verb comes back as it is, but for a multiword one's inner adverb ("a toujours besoin").
    effectiveVerb = negateFinite(conjugated);
    effectiveMod = innerAdverb(conjugated) ? '' : modifierText;
  }
  // The participe closes the verb group, behind whatever auxiliaries the tense/aspect/modals built.
  // A frequency adverb belongs between the finite verb and the participe ("n'est jamais mangée"),
  // which the aspect and modal branches above already arrange for their own tails; the simple
  // tenses put it in the trailing slot, so the passive takes it back into the group. A short adverb
  // stands right before the participe on every tense ("est bien mangée", "a été bien mangée", A294).
  if (passive) {
    const frequencyInGroup = isFrequency ? effectiveMod : '';
    effectiveVerb = [effectiveVerb, frequencyInGroup, preInfinitive, passiveParticipleText].filter(Boolean).join(' ');
    if (isFrequency || preInfinitive) effectiveMod = '';
  }
  const complementsText = complementsAroundAdverb(modifier, adverbText, complements,
    (c) => complementsPhrase(c, subjectForms, verb.conceptId, directObject?.agreement, verb.forms));
  // A non-finite verb takes its whole negation in front, the clitic staying against the infinitive:
  // "ne pas le voir". A negative adverb is itself the negator ("ne jamais manger"), and an "aucun"
  // takes "ne" alone ("ne manger aucune souris"), as `negateFinite` has it; "ne" elides against the
  // word after it ("n'aimer aucun chat"). Shared by the instruction register and the infinitive mood.
  const negativeAdverb = isNegativeAdverb(modifier);
  const infinitiveMod = negativeAdverb || preInfinitive ? '' : modifierText;
  // A passive citation is the infinitive of the auxiliary plus the participe ("être mangée"), a short
  // adverb before the participe ("être bien mangée", A294).
  const infinitiveGroup = passive
    ? [finiteVerb.forms['base'] ?? '', preInfinitive, passiveParticipleText].filter(Boolean).join(' ')
    : '';
  const negateInfinitive = (inf: string): string => {
    // "bien" leads the infinitive here too, behind any "ne pas": "bien manger", "ne pas bien manger".
    const group = [auxiliaryPreInfinitive, frCliticize(objectClitic, inf)].filter(Boolean).join(' ');
    if (!verbNegative && !aucun && !negativeAdverb) return group;
    return negateNonFinite(negativeAdverb ? modifierText : verbNegative && !aucun ? 'pas' : '', group);
  };
  // Imperative: a subjectless command. The person picks the form (tu / nous / vous — the -er
  // "tu" dropping its final -s); a single paradigm serves both polarities, with negation wrapped
  // by `negateFinite` ("ne cours pas", "ne sois pas prudent", "aucun"/"jamais" taking bare "ne").
  if (mood === 'imperative') {
    // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
    // infinitive in French ("Charger une période", "Ne pas courir"), not the imperative.
    if (register === 'instruction') {
      return withDislocated([negateInfinitive(infinitiveGroup || verb.forms['base'] || conjugated), infinitiveMod, directObjectText, complementsText]
        .filter(Boolean)
        .join(' '));
    }
    const pn = moodPN(subjectForms);
    const impForm = imperativeForm('fr', verb, pn, false) ?? conjugated;
    // An affirmative command puts its pronouns after the verb ("vois-moi", "effondre-toi"); the
    // negative one keeps them in front, inside "ne … pas" ("ne me vois pas", "ne t'effondre pas").
    const affirmative = !verbNegative && !aucun && !groupNegative;
    const reflexive = /^(?:s'|se )/.test(verb.forms['base'] ?? '');
    // A multiword command keeps its noun after the negation and the inner adverb: "n'aie pas besoin".
    const impVerb = affirmative
      ? frEnclitic(negateFinite(impForm), objectClitic, reflexive, pn)
      : frCliticize(objectClitic, negateFinite(impForm));
    return withDislocated([impVerb, innerAdverb(impForm) ? '' : modifierText, directObjectText, complementsText]
      .filter(Boolean)
      .join(' '));
  }
  // Infinitive / citation phrase: the bare infinitive ("consommer la nourriture"), the same surface
  // French already gives the imperative `instruction` register above. Negation precedes the whole
  // infinitive ("ne pas consommer"); an object pronoun is proclitic ("le consommer"), via
  // `negateInfinitive`.
  if (mood === 'infinitive') {
    return withDislocated([negateInfinitive(infinitiveGroup || verb.forms['base'] || conjugated), infinitiveMod, directObjectText, complementsText]
      .filter(Boolean)
      .join(' '));
  }
  return withDislocated([frCliticize(finiteClitic, effectiveVerb), effectiveMod, directObjectText, complementsText]
    .filter(Boolean)
    .join(' '));
}
