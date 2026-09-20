import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isFrequencyAdverb } from '../../functions/isFrequencyAdverb.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { adverbSlots } from './adverbSlots.js';
import { complementsPhrase } from './complementsPhrase/index.js';
import { deImperativePN } from './deImperativePN.js';
import { deImperativeWord } from './deImperativeWord.js';
import { dimensionGloss } from './dimensionGloss.js';
import { finiteNegation } from './finiteNegation.js';
import { hasPrepositionalComplement } from './hasPrepositionalComplement.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { nonReflexiveVerb } from './nonReflexiveVerb.js';
import { prospectiveFrame } from './prospectiveFrame.js';
import { reflexivePronoun } from './reflexivePronoun.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
import { splitObject } from './splitObject.js';
import { subjectText } from './subjectText.js';
import { verbFinalCluster } from './verbFinalCluster.js';
import { verbGroup } from './verbGroup.js';
import { zuInfinitive } from './zuInfinitive.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
// `inverted` renders the clause with the finite verb ahead of the subject, for when something
// else already fills the front field (see COORD_INVERTS). `verbFinal` renders it as a subordinate
// clause — the finite verb closes it behind the non-finite tail ("wenn der Kater essen würde"),
// the same order the relative clause uses; it overrides `inverted`. A verbless or imperative
// clause has no V2 slot to move, so both flags are inert there. `zu` renders an infinitive clause
// as the zu-infinitive another clause governs ("zu handeln", "das Essen zu essen").
export function renderClause(phrase: ResolvedPhrase, inverted = false, verbFinal = false, zu = false): string {
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
    // A manner-definition gloss ("mit hoher Geschwindigkeit") is the adverbial fragment defining an adverb.
    if (!verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
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
    // subordinate means clause trails even the verb (see `splitMeansClause`).
    const { dative, rest: undative } = splitDative(negComplements);
    const { means, rest } = splitMeansClause(undative);
    const dativeText = complementsPhrase(dative);
    const meansText = complementsPhrase(means);
    // A reflexive verb ("sich bewegen") builds its verb forms as the plain verb, and its pronoun,
    // agreeing with the subject, leads the Mittelfeld's pronoun slot: "bewegt sich nicht", "beweg
    // dich", "sich schnell bewegen". An instruction and the citation are infinitives, so "sich".
    const plain = nonReflexiveVerb(verb).forms;
    const withReflexive = (pn: string, pronoun: string) => [reflexivePronoun(verb.forms, pn), pronoun].filter(Boolean).join(' ');

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
      const impComplements = [proPlace, impDirect.prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
      // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
      // infinitive, and the infinitive is clause-final, so it inverts the V1 command order:
      // "Ein Satzgefüge laden", "Das Brot nicht essen" (vs the command "Iss das Brot nicht").
      const impPronoun = withReflexive(register === 'instruction' ? '3sg' : ipn, impDirect.pronoun);
      const mittelfeld = [impPronoun, impAdverb.nichtBeforeObject, impAdverb.beforeObject, dativeText, impDirect.noun,
        impAdverb.nichtAfterObject, impAdverb.afterObject, neg.beforeComplements, impComplements, neg.after];
      // A separable verb's particle closes the command ("füge die Maus hinzu", A138); the instruction's
      // infinitive keeps it ("die Maus hinzufügen").
      const parts = register === 'instruction'
        ? [...mittelfeld, plain['base'] ?? word, meansText]
        : [word, ...mittelfeld, verb.forms['particle'] ?? '', meansText];
      return parts.filter(Boolean).join(' ').trim();
    }

    // Infinitive / citation phrase: the dictionary infinitive, clause-final and subject-less, with
    // its object ahead of it ("Nahrung konsumieren", "das Brot nicht essen"). This is the surface
    // German already gives the imperative `instruction` register above; the infinitive is `base`.
    if (mood === 'infinitive') {
      // Negated as the declarative is (see the command above): "keine Maus essen", "nie eine Maus essen".
      const infAdverb = adverbSlots(modifier, neg, '');
      const infDirect = splitObject(objectToRender, proObject, objectPrep);
      const infComplements = [proPlace, infDirect.prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
      // Governed by another clause, it is the zu-infinitive ("zu handeln", "hinzuzufügen").
      const infVerb = zu ? zuInfinitive(plain) : (plain['base'] ?? '');
      return [withReflexive('3sg', infDirect.pronoun), infAdverb.nichtBeforeObject, infAdverb.beforeObject, dativeText, infDirect.noun,
        infAdverb.nichtAfterObject, infAdverb.afterObject, neg.beforeComplements, infComplements, neg.after, infVerb, meansText]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    // The verb complex is split across the clause: the finite verb (werden/sein, the outermost
    // modal, or the conjugated main verb) sits in the V2 slot, any "gerade"/"im Begriff"
    // follows it, and the non-finite tail (infinitive / Partizip / the modal stack) closes the
    // clause. Aspect is rendered by verbGroup/modalVerbGroup, which a relative clause reaches
    // through the same helpers (see subordinateClause).
    const person = subject.agreement['person'] ?? '3';
    const number = subject.agreement['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const complex = verbPhrase.modals.length > 0
      ? modalVerbGroup(verbPhrase.modals, plain, pn, tense, aspect, mood)
      : verbGroup(plain, pn, tense, aspect, mood);
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = complex;
    // "nicht" is dropped under "nie" or a "kein" object, and otherwise leads an adverb or a predicate
    // complement or trails the objects. It precedes the prospective's "im Begriff" as a whole: "ist
    // NICHT im Begriff zu essen" (is NOT about to eat), never "ist im Begriff NICHT zu essen". The
    // progressive's "gerade" takes it after instead ("isst gerade nicht").
    // An object pronoun leads the Mittelfeld, ahead of "gerade", "nicht" and the adverbs; a noun object
    // follows them (see `splitObject`).
    const { pronoun: objectPronoun, noun: directObjectText, prepositional } = splitObject(objectToRender, proObject, objectPrep);
    const objectPronounText = withReflexive(pn, objectPronoun);
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // Each modal's own adverb sits in the Mittelfeld in scope order (outermost first), ahead of the
    // main verb's adverb: "er will nie immer gehen" (never wants to always go).
    const modalAdverbsText = modalAdverbs(verbPhrase.modals);
    // The main verb's own adverb splits on its kind: a direction adverb follows the objects, every
    // other one leads them, and the "nicht" that marks the adverb slot goes where the adverb went.
    const adverb = adverbSlots(modifier, neg, modalAdverbsText);
    const complementsText = [proPlace, prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
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
      : [objectPronounText, aspectMid, adverb.nichtBeforeObject, modalAdverbsText, adverb.beforeObject, dativeText, directObjectText,
        adverb.nichtAfterObject, adverb.afterObject, neg.beforeComplements, complementsText, neg.after,
        ...(verbFinal ? verbFinalCluster(complex) : [infinitiveTail, complex.particle ?? ''])];
    return [...head, ...predicate, meansText].filter(Boolean).join(' ').trim();
}
