import type { ResolvedNounElement, ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { foldModalGovernor } from '../../functions/foldModalGovernor.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { isFrequencyAdverb } from '../../functions/isFrequencyAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { passiveParticiple } from '../../functions/passiveParticiple.js';
import { adverbSlots } from './adverbSlots.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase/index.js';
import { complementsWithNicht } from './complementsWithNicht.js';
import { deImperativePN } from './deImperativePN.js';
import { deImperativeWord } from './deImperativeWord.js';
import { complementGloss } from './complementGloss.js';
import { dimensionGloss } from './dimensionGloss.js';
import { finiteNegation } from './finiteNegation.js';
import { hasPrepositionalComplement } from './hasPrepositionalComplement.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { meansClause } from './meansClause.js';
import { meansDoer } from './meansDoer.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalStack } from './modalStack.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { passiveComplex } from './passiveComplex.js';
import { prospectiveFrame } from './prospectiveFrame.js';
import { reflexivePronoun } from './reflexivePronoun.js';
import { relativeGloss } from './relativeGloss.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
import { splitObject } from './splitObject.js';
import { subjectText } from './subjectText.js';
import { verbFinalCluster } from './verbFinalCluster.js';
import { verbGroup } from './verbGroup.js';
import { zuInfinitive } from './zuInfinitive.js';

/**
 * The determiners that make an object *known* — the ones that let it stand ahead of the negation
 * (A191). A quantifier ("alle", "einige", "viele") is left behind "nicht", because moving it across
 * the negation would change its scope, and an indefinite one is A182's "kein".
 */
const KNOWN_OBJECT_DETERMINERS = new Set(['definite', 'this', 'that']);

/**
 * Whether the direct object stands **ahead** of the "nicht"+adverb group in the Mittelfeld (A191).
 * German leaves a known object where it stands without the adverb and lets "nicht" lead the adverb
 * behind it: "frisst die Maus nicht schnell", not "frisst nicht schnell die Maus", which reads as a
 * contrast ("not the mouse, but …").
 *
 * It applies only when "nicht" actually holds the adverb slot (`nichtBeforeObject`), and only to an
 * object that renders in the Mittelfeld's noun slot — a lone pronoun already leads from the pronoun
 * slot, a prepositional object (A139) stands with the complements, and a passive's by-phrase, which
 * borrows the noun slot, is not an object and stays where it is. Every conjunct must be known: a
 * group mixing a definite and a quantified conjunct keeps the whole object behind "nicht". A pronoun
 * conjunct is known: a coordination is never a clitic (A53), so a group holding a pronoun renders in
 * the noun slot and leads as a group of nouns does — "frisst ihn und den Hund nicht schnell" (A212).
 *
 * Kept as one predicate because the three middle fields below — the declarative (shared by the
 * question and the "wenn" protasis), the command/instruction and the infinitive — each splice their
 * own slot list and must agree on the answer.
 */
function objectLeadsNicht(nichtBeforeObject: string, objectNoun: string, directObject?: ResolvedNounElement): boolean {
  if (!nichtBeforeObject || !objectNoun || !directObject) return false;
  return directObject.conjuncts.every((np) =>
    !!np.head.forms['person'] || KNOWN_OBJECT_DETERMINERS.has(np.head.forms['definiteness'] ?? 'definite'));
}

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
// `inverted` renders the clause with the finite verb ahead of the subject, for when something
// else already fills the front field (see COORD_INVERTS). `verbFinal` renders it as a subordinate
// clause — the finite verb closes it behind the non-finite tail ("wenn der Kater essen würde"),
// the same order the relative clause uses; it overrides `inverted`. A verbless or imperative
// clause has no V2 slot to move, so both flags are inert there. `zu` renders an infinitive clause
// as the zu-infinitive another clause governs ("zu handeln", "das Essen zu essen").
export function renderClause(given: ResolvedPhrase, inverted = false, verbFinal = false, zu = false): string {
  // A modal governing an infinitive is the modal chain over it, in the verb cluster: "handeln wollen",
  // never "wollen, zu handeln" (A222, see `foldModalGovernor`).
  const phrase = foldModalGovernor(given);
  const clause = clauseText(phrase, inverted, verbFinal, zu);
  // An infinitive complement is extraposed behind the whole clause, verb-final tail included, after
  // a comma: "fähig sein, zu handeln", "der Kater wird wünschen, das Essen zu essen".
  const governed = phrase.infinitiveComplement
    ? `${clause}, ${renderClause(phrase.infinitiveComplement, false, false, true)}`
    : clause;
  // A clause of purpose is extraposed the same way, inside the "um … zu" frame German puts a final
  // clause in: "klicken, um zu ändern", "ein Subjekt selektieren, um die Übersetzungen zu sehen".
  return phrase.purpose
    ? `${governed}, um ${renderClause(phrase.purpose, false, false, true)}`
    : governed;
}

function clauseText(phrase: ResolvedPhrase, inverted: boolean, verbFinal: boolean, zu: boolean): string {
    const { subject, verbPhrase, directObject } = phrase;
    // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("von
    // großer Größe"), not a bare subject noun phrase — wrap the dimension NP (dative) in its adposition.
    if (!verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
    // A complement-definition gloss ("in allen Orten", "zu einem höheren Ort") is the place or direction complement
    // that defines an adverb, as a clause renders it.
    if (!verbPhrase && isComplementGloss(subject)) return complementGloss(subject);
    // A manner-definition gloss ("mit hoher Geschwindigkeit") is the adverbial fragment defining an adverb.
    if (!verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
    // A relative-clause gloss ("den man gespeichert hat") is the head's relative alone, its pronoun
    // still taking the head's gender and number, with no comma to set it off from a head.
    if (!verbPhrase && isRelativeGloss(subject)) return relativeGloss(firstConjunct(subject));
    const subj = subjectText(subject);
    // Verbless period: a bare noun phrase ("aktuelle Nachrichten").
    if (!verbPhrase) return subj.trim();
    const { verb, modifier, tense = 'present', aspect = 'neutral', mood, register } = verbPhrase;

    // An elided subject complement leaves its pro-form (A121): "es" for a predicate, a pronoun in the
    // object slot ahead of "nicht" ("der Hund ist es nicht", "wird es nicht sein"); "da" for a place,
    // which "nicht" leads as it leads a predicate ("der Hund ist nicht da").
    const proObject = verbPhrase.elided?.type === 'predicative' ? 'es' : '';
    const proPlace = verbPhrase.elided?.type === 'locative' ? 'da' : '';
    // An object a preposition leads ("auf die Taste", A139) stands where a predicate complement does, so
    // "nicht" leads it as well: "klickt nicht auf die Taste".
    const objectPrep = objectPreposition(verb);
    // Everything "nicht" leads rather than follows: a predicate complement, the elided place's "da",
    // a prepositional object, and — A159 — any complement that renders as a prepositional phrase
    // ("geht nicht zum Markt", never "*geht zum Markt nicht"). A bare-dative recipient and a
    // Nachfeld means clause are not among them, which `hasPrepositionalComplement` decides.
    const leadsComplements = !!phrase.complements?.['predicative'] || hasPrepositionalComplement(phrase.complements)
      || !!proPlace || (!!objectPrep && !!directObject);
    // How the clause negates, decided ONCE for it: which source carries the negation, and the object
    // and complements to render once the others have given up their "kein" (see `finiteNegation`).
    // The declarative, the command and the instruction/infinitive below all share this one answer.
    const { nicht: neg, directObject: objectToRender, complements: negComplements } = finiteNegation({
      subjectIsNegative: subject.agreement['definiteness'] === 'no',
      verbPhrase, directObject, complements: phrase.complements,
    }, leadsComplements);
    // The dative recipient leads the accusative object; the other complements trail it, and a
    // subordinate means clause trails even the verb (see `splitMeansClause`). Its subject is the
    // pronoun of whoever does this clause's act, "man" when that is no one (B06, see `meansDoer`).
    const { dative, rest: undative } = splitDative(negComplements, verb.forms);
    const { means, rest } = splitMeansClause(undative);
    const dativeText = complementsPhrase(dative, verb.forms);
    const meansText = meansClause(means, meansDoer(phrase, zu));
    // A reflexive verb ("sich bewegen") builds its verb forms as the plain verb, and its pronoun,
    // agreeing with the subject, leads the Mittelfeld's pronoun slot: "bewegt sich nicht", "beweg
    // dich", "sich schnell bewegen". An instruction and the citation are infinitives, so "sich".
    //
    // The passive conjugates "werden" in place of the lexical verb, which comes along as its
    // Partizip II at the head of the clause-final material (see `passiveComplex`): "das Essen wird
    // gegessen", "wurde gegessen", "wird gegessen werden", "muss gegessen werden". A passive is
    // never reflexive, whatever the lexical verb is.
    const passive = verbPhrase.voice === 'passive' && !!verbPhrase.passiveAux;
    const plain = passive ? verbPhrase.passiveAux!.forms : nonReflexiveVerb(verb).forms;
    const passiveParticipleText = passive ? passiveParticiple(verb) : '';
    const withReflexive = (pn: string, pronoun: string) =>
      [passive ? '' : reflexivePronoun(verb.forms, pn), pronoun].filter(Boolean).join(' ');

    // Imperative: a subjectless V1 command. The subject's person picks the form; "nicht" takes the
    // declarative's slots (see `nichtSlots`): before the adverb ("iss nicht schnell"), before a
    // predicate complement ("sei nicht vorsichtig"), otherwise after the objects ("iss das Brot nicht").
    if (mood === 'imperative') {
      const ipn = deImperativePN(subject.agreement);
      const word = deImperativeWord(plain, ipn);
      // The command negates as the declarative does (the shared decision above): no "nicht" beside
      // "nie" or a "kein" object, and "kein" drops to "ein" under "nie" ("iss keine Maus", "iss nie
      // eine Maus").
      const impDirect = splitObject(objectToRender, proObject, objectPrep);
      // A direction adverb follows the object ("das Buch nach oben verschieben"); every other adverb
      // keeps the Mittelfeld slot ahead of it ("iss nicht schnell"). See `adverbSlots`.
      const impAdverb = adverbSlots(modifier, neg, '');
      const impComplements = complementsWithNicht([proPlace, impDirect.prepositional], rest, verb.forms, neg.beforeComplements, subject.agreement);
      // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
      // infinitive, and the infinitive is clause-final, so it inverts the V1 command order:
      // "Ein Satzgefüge laden", "Das Brot nicht essen" (vs the command "Iss das Brot nicht").
      const impPronoun = withReflexive(register === 'instruction' ? '3sg' : ipn, impDirect.pronoun);
      // A known object leads the "nicht"+adverb group instead of trailing it: "iss die Maus nicht
      // schnell", not "iss nicht schnell die Maus" (A191, see `objectLeadsNicht`).
      const impObjects = [dativeText, impDirect.noun];
      const impLeads = objectLeadsNicht(impAdverb.nichtBeforeObject, impDirect.noun, objectToRender);
      const mittelfeld = [impPronoun, ...(impLeads ? impObjects : []),
        impAdverb.nichtBeforeObject, impAdverb.beforeObject, ...(impLeads ? [] : impObjects),
        impAdverb.nichtAfterObject, impAdverb.afterObject, impComplements, neg.after];
      // A separable verb's particle closes the command ("füge die Maus hinzu", A138); the instruction's
      // infinitive keeps it ("die Maus hinzufügen").
      const parts = register === 'instruction'
        ? [...mittelfeld, [passiveParticipleText, plain['base'] ?? word].filter(Boolean).join(' '), meansText]
        : [word, ...mittelfeld, verb.forms['particle'] ?? '', meansText];
      return parts.filter(Boolean).join(' ').trim();
    }

    // Infinitive / citation phrase: the dictionary infinitive, clause-final and subject-less, with
    // its object ahead of it ("Nahrung konsumieren", "das Brot nicht essen"). This is the surface
    // German already gives the imperative `instruction` register above; the infinitive is `base`.
    if (mood === 'infinitive') {
      // Negated as the declarative is (see the command above): "keine Maus essen", "nie eine Maus essen".
      // A folded modal chain's adverbs (A222) lead the main verb's, as in the finite clause.
      const infModalAdverbs = modalAdverbs(verbPhrase.modals);
      const infAdverb = adverbSlots(modifier, neg, infModalAdverbs);
      const infDirect = splitObject(objectToRender, proObject, objectPrep);
      // A passive has no accusative object; the by-phrase takes its slot, as in a finite clause.
      const infObject = passive ? agentPhrase(phrase.agent) : infDirect.noun;
      const infComplements = complementsWithNicht([proPlace, infDirect.prepositional], rest, verb.forms, neg.beforeComplements, subject.agreement);
      // Governed by another clause, it is the zu-infinitive ("zu handeln", "hinzuzufügen"). A
      // passive citation puts the Partizip II in front of the auxiliary's infinitive, where the
      // finite clause puts it too: "gegessen werden", "gegessen zu werden".
      // A citation carries modals only as the chain a modal-headed clause folds into (A222, see
      // `foldModalGovernor`): they stack behind the main verb, innermost first, and the last of them
      // takes the "zu" — "handeln wollen", "Gegenstände haben können", "handeln zu wollen".
      const infModals = modalStack(verbPhrase.modals, true);
      const infinitive = (forms: Record<string, string>) => (zu ? zuInfinitive(forms) : (forms['base'] ?? ''));
      const infVerb = [passiveParticipleText, ...(infModals.length > 0
        ? [plain['base'] ?? '', ...infModals.slice(0, -1), infinitive({ base: infModals[infModals.length - 1] })]
        : [infinitive(plain)])]
        .filter(Boolean).join(' ');
      // As in the command: a known object leads the "nicht"+adverb group ("das Essen nicht immer
      // essen", A191). A passive's by-phrase borrows the object slot and is not one, so it stays.
      const infObjects = [dativeText, infObject];
      const infLeads = !passive && objectLeadsNicht(infAdverb.nichtBeforeObject, infDirect.noun, objectToRender);
      return [withReflexive('3sg', infDirect.pronoun), ...(infLeads ? infObjects : []),
        infAdverb.nichtBeforeObject, infModalAdverbs, infAdverb.beforeObject, ...(infLeads ? [] : infObjects),
        infAdverb.nichtAfterObject, infAdverb.afterObject, infComplements, neg.after, infVerb, meansText]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    // The verb complex is split across the clause: the finite verb (werden/sein, the outermost
    // modal, or the conjugated main verb) sits in the V2 slot, any "gerade"/"im Begriff"
    // follows it, and the non-finite tail (infinitive / Partizip / the modal stack) closes the
    // clause. Aspect is rendered by verbGroup/modalVerbGroup, which a relative clause reaches
    // through the same helpers (see subordinateClause).
    // A verb ahead of its subject agrees with an "or" group's first conjunct, the one nearest it (A210):
    // "laufen die Kater oder der Hund?".
    const agreement = inverted && !verbFinal ? subject.invertedAgreement ?? subject.agreement : subject.agreement;
    const person = agreement['person'] ?? '3';
    const number = agreement['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const built = verbPhrase.modals.length > 0
      ? modalVerbGroup(verbPhrase.modals, plain, pn, tense, aspect, mood)
      : verbGroup(plain, pn, tense, aspect, mood);
    const complex = passive ? passiveComplex(built, passiveParticipleText) : built;
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = complex;
    // "nicht" is dropped under "nie" or a "kein" object, and otherwise leads an adverb or a predicate
    // complement or trails the objects. It precedes the prospective's "im Begriff" as a whole: "ist
    // NICHT im Begriff zu essen" (is NOT about to eat), never "ist im Begriff NICHT zu essen". The
    // progressive's "gerade" takes it after instead ("isst gerade nicht").
    // An object pronoun leads the Mittelfeld, ahead of "gerade", "nicht" and the adverbs; a noun object
    // follows them (see `splitObject`).
    // A passive has no accusative object left — the patient is this clause's subject now — so the
    // Mittelfeld's noun-object slot carries the by-phrase instead, which is where German puts it:
    // "das Essen wird von der Katze im Haus gegessen".
    const { pronoun: objectPronoun, noun: objectNoun, prepositional } = splitObject(objectToRender, proObject, objectPrep);
    const directObjectText = passive ? agentPhrase(phrase.agent) : objectNoun;
    const objectPronounText = withReflexive(pn, objectPronoun);
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // Each modal's own adverb sits in the Mittelfeld in scope order (outermost first), ahead of the
    // main verb's adverb: "er will nie immer gehen" (never wants to always go).
    const modalAdverbsText = modalAdverbs(verbPhrase.modals);
    // The main verb's own adverb splits on its kind: a direction adverb follows the objects, every
    // other one leads them, and the "nicht" that marks the adverb slot goes where the adverb went.
    const adverb = adverbSlots(modifier, neg, modalAdverbsText);
    // A known object leads the whole "nicht" + adverbs group rather than trailing it — "frisst die
    // Maus nicht schnell", "gibt dem Hund das Buch nicht schnell" (A191). The dative recipient keeps
    // its place in front of the accusative object and travels with it.
    const objects = [dativeText, directObjectText];
    const objectLeads = !passive && objectLeadsNicht(adverb.nichtBeforeObject, objectNoun, objectToRender);
    const complementsText = complementsWithNicht([proPlace, prepositional], rest, verb.forms, neg.beforeComplements, subject.agreement);
    // V2 order puts the finite verb after the subject (before it when inverted). Verb-final
    // (subordinate) order leads with the subject and closes the clause on the finite verb, behind the
    // non-finite tail — "der Kater essen würde" — mirroring `subordinateClause`. It is used for the
    // "wenn" protasis of a conditional.
    const head =verbFinal ? [subj] : inverted ? [verbText, subj] : [subj, verbText];
    // The prospective keeps its zu-infinitive group whole ("ist im Begriff, die Maus zu essen").
    // A frequency adverb scopes over the whole prospective, not over the zu-infinitive alone — "war
    // NIE im Begriff zu lieben", where "im Begriff, nie zu lieben" says the opposite (A146). Under a
    // modal it stays in the group: German "muss nie" means "need never", a separate judgement.
    const prospectiveFrequency = isFrequencyAdverb(modifier) && verbPhrase.modals.length === 0 ? modifierText : '';
    const predicate = complex.zuInfinitive
      ? prospectiveFrame(complex, {
        nicht: neg.beforeAspect, modalAdverbs: modalAdverbsText, frequencyAdverb: prospectiveFrequency,
        pronoun: objectPronounText,
        adverb: prospectiveFrequency ? '' : adverb.beforeObject, dative: dativeText, directObject: directObjectText,
        directionAdverb: adverb.afterObject, complements: complementsText,
      }, verbFinal)
      : [objectPronounText, aspectMid, ...(objectLeads ? objects : []),
        adverb.nichtBeforeObject, modalAdverbsText, adverb.beforeObject, ...(objectLeads ? [] : objects),
        adverb.nichtAfterObject, adverb.afterObject, complementsText, neg.after,
        ...(verbFinal ? verbFinalCluster(complex) : [infinitiveTail, complex.particle ?? ''])];
    return [...head, ...predicate, meansText].filter(Boolean).join(' ').trim();
}
