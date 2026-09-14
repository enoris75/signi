import type { ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { complementsPhrase } from './complementsPhrase/index.js';
import { deImperativePN } from './deImperativePN.js';
import { deImperativeWord } from './deImperativeWord.js';
import { dimensionGloss } from './dimensionGloss.js';
import { finiteNegation } from './finiteNegation.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { prospectiveFrame } from './prospectiveFrame.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
import { splitObject } from './splitObject.js';
import { subjectText } from './subjectText.js';
import { verbFinalCluster } from './verbFinalCluster.js';
import { verbGroup } from './verbGroup.js';

/** One clause (subject + predicate), ignoring any attached hypothetical condition. */
// `inverted` renders the clause with the finite verb ahead of the subject, for when something
// else already fills the front field (see COORD_INVERTS). `verbFinal` renders it as a subordinate
// clause — the finite verb closes it behind the non-finite tail ("wenn der Kater essen würde"),
// the same order the relative clause uses; it overrides `inverted`. A verbless or imperative
// clause has no V2 slot to move, so both flags are inert there.
export function renderClause(phrase: ResolvedPhrase, inverted = false, verbFinal = false): string {
    const { subject, verbPhrase, directObject } = phrase;
    // A verbless period marked as an adjective-definition gloss is a prepositional fragment ("von
    // großer Größe"), not a bare subject noun phrase — wrap the dimension NP (dative) in its adposition.
    if (!verbPhrase && isDimensionGloss(subject)) return dimensionGloss(firstConjunct(subject), subject);
    // A manner-definition gloss ("mit hoher Geschwindigkeit") is the adverbial fragment defining an adverb.
    if (!verbPhrase && isMannerGloss(subject)) return mannerGloss(subject);
    // The dative recipient leads the accusative object; the other complements trail it, and a
    // subordinate means clause trails even the verb (see `splitMeansClause`).
    const { dative, rest: undative } = splitDative(phrase.complements);
    const { means, rest } = splitMeansClause(undative);
    const dativeText = complementsPhrase(dative);
    const meansText = complementsPhrase(means);
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
    const hasPredicative = !!phrase.complements?.['predicative'] || !!proPlace || (!!objectPrep && !!directObject);

    // Imperative: a subjectless V1 command. The subject's person picks the form; "nicht" takes the
    // declarative's slots (see `nichtSlots`): before the adverb ("iss nicht schnell"), before a
    // predicate complement ("sei nicht vorsichtig"), otherwise after the objects ("iss das Brot nicht").
    if (mood === 'imperative') {
      const word = deImperativeWord(verb.forms, deImperativePN(subject.agreement));
      // The command negates as the declarative does: no "nicht" beside "nie" or a "kein" object, and
      // "kein" drops to "ein" under "nie" ("iss keine Maus", "iss nie eine Maus").
      const { nicht: neg, directObject: impObject } = finiteNegation(verbPhrase, directObject, hasPredicative);
      const impDirect = splitObject(impObject, proObject, objectPrep);
      const impModifier = modifier ? (modifier.forms['base'] ?? '') : '';
      const impComplements = [proPlace, impDirect.prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
      // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
      // infinitive, and the infinitive is clause-final, so it inverts the V1 command order:
      // "Ein Satzgefüge laden", "Das Brot nicht essen" (vs the command "Iss das Brot nicht").
      const mittelfeld = [impDirect.pronoun, neg.beforeAdverb, impModifier, dativeText, impDirect.noun, neg.beforePredicative, impComplements, neg.after];
      // A separable verb's particle closes the command ("füge die Maus hinzu", A138); the instruction's
      // infinitive keeps it ("die Maus hinzufügen").
      const parts = register === 'instruction'
        ? [...mittelfeld, verb.forms['base'] ?? word, meansText]
        : [word, ...mittelfeld, verb.forms['particle'] ?? '', meansText];
      return parts.filter(Boolean).join(' ').trim();
    }

    // Infinitive / citation phrase: the dictionary infinitive, clause-final and subject-less, with
    // its object ahead of it ("Nahrung konsumieren", "das Brot nicht essen"). This is the surface
    // German already gives the imperative `instruction` register above; the infinitive is `base`.
    if (mood === 'infinitive') {
      const infModifier = modifier ? (modifier.forms['base'] ?? '') : '';
      // Negated as the declarative is (see the command above): "keine Maus essen", "nie eine Maus essen".
      const { nicht: neg, directObject: infObject } = finiteNegation(verbPhrase, directObject, hasPredicative);
      const infDirect = splitObject(infObject, proObject, objectPrep);
      const infComplements = [proPlace, infDirect.prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
      return [infDirect.pronoun, neg.beforeAdverb, infModifier, dativeText, infDirect.noun, neg.beforePredicative, infComplements, neg.after, verb.forms['base'] ?? '', meansText]
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
      ? modalVerbGroup(verbPhrase.modals, verb.forms, pn, tense, aspect, mood)
      : verbGroup(verb.forms, pn, tense, aspect, mood);
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = complex;
    // "nicht" is dropped under "nie" or a "kein" object, and otherwise leads an adverb or a predicate
    // complement or trails the objects. It precedes the prospective's "im Begriff" as a whole: "ist
    // NICHT im Begriff zu essen" (is NOT about to eat), never "ist im Begriff NICHT zu essen". The
    // progressive's "gerade" takes it after instead ("isst gerade nicht").
    const { nicht: neg, directObject: objectToRender } = finiteNegation(verbPhrase, directObject, hasPredicative);
    // An object pronoun leads the Mittelfeld, ahead of "gerade", "nicht" and the adverbs; a noun object
    // follows them (see `splitObject`).
    const { pronoun: objectPronounText, noun: directObjectText, prepositional } = splitObject(objectToRender, proObject, objectPrep);
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // Each modal's own adverb sits in the Mittelfeld in scope order (outermost first), ahead of the
    // main verb's adverb: "er will nie immer gehen" (never wants to always go).
    const modalAdverbsText = modalAdverbs(verbPhrase.modals);
    const complementsText = [proPlace, prepositional, complementsPhrase(rest, verb.forms)].filter(Boolean).join(' ');
    // V2 order puts the finite verb after the subject (before it when inverted). Verb-final
    // (subordinate) order leads with the subject and closes the clause on the finite verb, behind the
    // non-finite tail — "der Kater essen würde" — mirroring `subordinateClause`. It is used for the
    // "wenn" protasis of a conditional.
    const head =verbFinal ? [subj] : inverted ? [verbText, subj] : [subj, verbText];
    // The prospective keeps its zu-infinitive group whole ("ist im Begriff, die Maus zu essen").
    const predicate = complex.zuInfinitive
      ? prospectiveFrame(complex, {
        nicht: neg.beforeAspect, modalAdverbs: modalAdverbsText, pronoun: objectPronounText,
        adverb: modifierText, dative: dativeText, directObject: directObjectText, complements: complementsText,
      }, verbFinal)
      : [objectPronounText, aspectMid, neg.beforeAdverb, modalAdverbsText, modifierText, dativeText, directObjectText, neg.beforePredicative, complementsText, neg.after, ...(verbFinal ? verbFinalCluster(complex) : [infinitiveTail, complex.particle ?? ''])];
    return [...head, ...predicate, meansText].filter(Boolean).join(' ').trim();
}
