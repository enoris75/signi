import { firstConjunct, groupHasNegativeAdverb, withDefiniteness, type ResolvedPhrase } from '../../types.js';
import { complementsPhrase } from './complementsPhrase.js';
import { deImperativePN } from './deImperativePN.js';
import { deImperativeWord } from './deImperativeWord.js';
import { dimensionGloss } from './dimensionGloss.js';
import { elementPhrase } from './elementPhrase.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { mannerGloss } from './mannerGloss.js';
import { modalAdverbs } from './modalAdverbs.js';
import { modalVerbGroup } from './modalVerbGroup.js';
import { splitDative } from './splitDative.js';
import { splitMeansClause } from './splitMeansClause.js';
import { subjectText } from './subjectText.js';
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
    const { verb, negative: verbNegative, modifier, tense = 'present', aspect = 'neutral', mood, register } = verbPhrase;

    // Imperative: a subjectless V1 command. The subject's person picks the form; "nicht" negates,
    // sitting before a predicate complement ("sei nicht vorsichtig") but after the objects
    // otherwise ("iss das Brot nicht").
    if (mood === 'imperative') {
      const word = deImperativeWord(verb.forms, deImperativePN(subject.agreement));
      const impDirect = directObject ? elementPhrase(directObject, 'acc') : '';
      const impModifier = modifier ? (modifier.forms['base'] ?? '') : '';
      const applyNicht = verbNegative === true && modifier?.forms['polarity'] !== 'negative';
      const hasPredicative = !!phrase.complements?.['predicative'];
      const impComplements = complementsPhrase(rest);
      // An instruction addressed to nobody — a button, a menu entry, a recipe step — is the
      // infinitive, and the infinitive is clause-final, so it inverts the V1 command order:
      // "Ein Satzgefüge laden", "Das Brot nicht essen" (vs the command "Iss das Brot nicht").
      if (register === 'instruction') {
        return [impModifier, dativeText, impDirect, impComplements, applyNicht ? 'nicht' : '', verb.forms['base'] ?? word, meansText]
          .filter(Boolean)
          .join(' ')
          .trim();
      }
      const parts = [word, impModifier, dativeText, impDirect];
      if (hasPredicative) {
        if (applyNicht) parts.push('nicht');
        parts.push(impComplements);
      } else {
        parts.push(impComplements);
        if (applyNicht) parts.push('nicht');
      }
      parts.push(meansText);
      return parts.filter(Boolean).join(' ').trim();
    }

    // Infinitive / citation phrase: the dictionary infinitive, clause-final and subject-less, with
    // its object ahead of it ("Nahrung konsumieren", "das Brot nicht essen"). This is the surface
    // German already gives the imperative `instruction` register above; the infinitive is `base`.
    if (mood === 'infinitive') {
      const infModifier = modifier ? (modifier.forms['base'] ?? '') : '';
      const infDirect = directObject ? elementPhrase(directObject, 'acc') : '';
      const applyNicht = verbNegative === true && modifier?.forms['polarity'] !== 'negative';
      const infComplements = complementsPhrase(rest);
      return [infModifier, dativeText, infDirect, infComplements, applyNicht ? 'nicht' : '', verb.forms['base'] ?? '', meansText]
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    // The verb complex is split across the clause: the finite verb (werden/sein, the outermost
    // modal, or the conjugated main verb) sits in the V2 slot, any "gerade"/"im Begriff"
    // follows it, and the non-finite tail (infinitive / Partizip / "zu …" / the modal stack)
    // closes the clause. Aspect is rendered by verbGroup/modalVerbGroup, which a relative clause
    // reaches through the same helpers (see subordinateClause).
    const person = subject.agreement['person'] ?? '3';
    const number = subject.agreement['number'] ?? 'singular';
    const pn = `${person}${number === 'plural' ? 'pl' : 'sg'}`;
    const { v2: verbText, mid: aspectMid, tail: infinitiveTail } = verbPhrase.modals.length > 0
      ? modalVerbGroup(verbPhrase.modals, verb.forms, pn, tense, aspect, mood)
      : verbGroup(verb.forms, pn, tense, aspect, mood);
    // A negative adverb ("nie") on the main verb or ANY modal is itself the clause negator.
    const modifierIsNegative = groupHasNegativeAdverb(verbPhrase);
    // A `no` object's "kein" is itself the clause negator (kein = nicht + ein). With a NEGATIVE
    // ADVERB ("nie") also present, "nie keine Maus" would double the negative, so the object drops to
    // a plain indefinite — "isst nie eine Maus". (With a negated verb instead, "keine" stays and the
    // now-redundant "nicht" is dropped below.)
    const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
    const objectToRender = directObject && modifierIsNegative && objectIsNegative
      ? { ...directObject, conjuncts: directObject.conjuncts.map((np) => withDefiniteness(np, 'indefinite')) }
      : directObject;
    const directObjectText = objectToRender ? elementPhrase(objectToRender, 'acc') : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    // Each modal's own adverb sits in the Mittelfeld in scope order (outermost first), ahead of the
    // main verb's adverb: "er will nie immer gehen" (never wants to always go).
    const modalAdverbsText = modalAdverbs(verbPhrase.modals);
    // Any adverb in the Mittelfeld — a modal's or the main verb's — takes the "nicht immer" slot.
    const anyMidAdverb = modalAdverbsText || modifierText;

    // "nicht" precedes the modifier when one exists ("nicht immer"),
    // otherwise trails after objects ("das Brot nicht").
    // Skip "nicht" when the modifier is already negative ("nie" = never), or when the object's own
    // "kein" already negates the clause ("isst keine Maus", not "isst keine Maus nicht").
    const applyNicht = verbNegative && !modifierIsNegative && !objectIsNegative;
    // The prospective's "im Begriff …" is a predicate the negation scopes over as a whole, so
    // "nicht" precedes it on the finite auxiliary — "ist NICHT im Begriff zu essen" (is NOT about
    // to eat), never "ist im Begriff NICHT zu essen" (is about to NOT eat). It is the only aspect
    // whose "mid" behaves this way; the progressive's adverb "gerade" takes "nicht" after it
    // ("isst gerade nicht"). When it fires it is the sole "nicht", so the other slots stand down.
    const negProspective = applyNicht && aspect === 'prospective';
    // A predicate complement (copula/BECOME: "ist vorsichtig") is negated by "nicht"
    // *before* it — "ist nicht vorsichtig", not "*ist vorsichtig nicht". With an adverb
    // present the "nicht immer" placement already covers it, so guard on !modifierText.
    const hasPredicative = !!phrase.complements?.['predicative'];
    const negAspectMid = negProspective ? 'nicht' : '';
    const negBefore = !negProspective && applyNicht && anyMidAdverb ? 'nicht' : '';
    const negComplement = !negProspective && applyNicht && hasPredicative && !anyMidAdverb ? 'nicht' : '';
    const negAfter  = !negProspective && applyNicht && !anyMidAdverb && !hasPredicative ? 'nicht' : '';
    const complementsText = complementsPhrase(rest);
    // Verb-final (subordinate) order: the subject leads and the finite verb closes the clause,
    // behind the non-finite tail — "der Kater essen würde" — mirroring `subordinateClause`. Used
    // for the "wenn" protasis of a conditional.
    if (verbFinal) {
      return [subj, negAspectMid, aspectMid, negBefore, modalAdverbsText, modifierText, dativeText, directObjectText, negComplement, complementsText, negAfter, infinitiveTail, verbText, meansText]
        .filter(Boolean).join(' ').trim();
    }
    const head = inverted ? [verbText, subj] : [subj, verbText];
    return [...head, negAspectMid, aspectMid, negBefore, modalAdverbsText, modifierText, dativeText, directObjectText, negComplement, complementsText, negAfter, infinitiveTail, meansText]
      .filter(Boolean).join(' ').trim();
}
