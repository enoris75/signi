import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { negationSources } from '../../functions/negationSources.js';
import { withComplementDefiniteness } from '../../functions/withComplementDefiniteness.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import type { FiniteNegation } from './de.types.js';
import { modalAdverbs } from './modalAdverbs.js';
import { nichtSlots } from './nichtSlots.js';

/**
 * How a clause negates: the declarative, the verb-final "wenn" protasis, the relative clause, the
 * command, the instruction and the infinitive all decide it the same way, and place "nicht" by the
 * shared `nichtSlots`.
 *
 * German has no negative concord, so exactly one of the clause's negation sources (see
 * `negationSources`) may surface and the rest give way. Which one carries:
 *
 * - a negator standing **ahead** of the postverbal phrases carries the clause — a `no` SUBJECT
 *   ("kein Kater"), or a negative adverb ("nie") in the Mittelfeld — and the phrases behind it fall
 *   to the plain indefinite: "kein Kater frisst eine Maus", "isst nie eine Maus", "läuft nie in
 *   einem Haus" (A160, A158);
 * - failing that, a `kein` phrase carries it and the verb's own "nicht" goes, because "kein" is
 *   already "nicht + ein": "isst keine Maus", "läuft in keinem Haus", never "… keine Maus nicht";
 * - with both an object and a complement negative, the object is the leftmost and keeps its "kein",
 *   so the complement falls: "frisst keine Maus in einem Haus";
 * - otherwise the verb's "nicht", which `nichtSlots` places — unless an indefinite nominal can
 *   absorb it as "kein" (see `takesKein`), which is the same identity read the other way (A182),
 *   and never in the prospective, whose nominal stands inside the zu-group (A209).
 *
 * The verb *group* can deny more than one of its words, though (A03): the finite element, the main
 * verb a modal governs, and each inner modal each carry their own flag. German spells every one of
 * them "nicht" in the one Mittelfeld slot, so the clause places a count rather than a flag — "ich
 * will nicht nicht gehen". They are all the same clause's negation, so they give way together to a
 * negator that outranks them, and a lone one still absorbs into "kein".
 *
 * `leadsComplements` is whether the clause carries a constituent "nicht" leads rather than follows —
 * a predicate complement or a prepositional one (A159).
 */
export function finiteNegation(
  clause: {
    subjectIsNegative?: boolean;
    verbPhrase: ResolvedVerbPhrase;
    directObject?: ResolvedNounElement;
    complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  },
  leadsComplements: boolean,
): FiniteNegation {
  const { verbPhrase, directObject, complements } = clause;
  const neg = negationSources(clause);
  // One "nicht" per denied word of the verb group (A03), all in the slot the sentential one takes:
  // the finite element's (`neg.verb`), the main verb's own under a modal (`governedNegative`), and
  // each inner modal's — "ich will nicht nicht gehen", "ich muss nicht nicht gehen können". A single
  // "nicht" in a modal cluster already reads under any scope in German, so ¬want and want ¬go are
  // deliberately the same sentence; only denying two words at once adds a word.
  const governedNicht = verbPhrase.modals.length > 0 && verbPhrase.governedNegative === true ? 1 : 0;
  const innerNicht = verbPhrase.modals.filter((m, i) => i > 0 && m.negative === true).length;
  // German has no concord, so every one of them gives way where the finite one does: a "kein" or a
  // "nie" standing ahead carries the clause alone ("der Kater will kein Essen fressen").
  const carries = !neg.adverb && !neg.subject && !neg.object && !neg.complement;
  const count = carries ? (neg.verb ? 1 : 0) + governedNicht + innerNicht : 0;
  const negate = count === 1;
  // What already negates ahead of the postverbal phrases, and so takes their "kein" away.
  const negatedAhead = neg.subject || neg.adverb;
  const plainObject = neg.object && negatedAhead;
  const plainComplement = neg.complement && (negatedAhead || neg.object);
  // A182, the reverse of the downgrade above: the verb's own "nicht" is spelled into an indefinite
  // nominal as "kein" and disappears from the Mittelfeld ("frisst keine Maus", not "frisst eine Maus
  // nicht", which can only mean one particular mouse). The direct object takes it, and so does a
  // predicate nominal ("ist keine Legende", "scheint keine Legende zu sein" — ruled 2026-09-21).
  // The object is the leftmost, so when both could take it the object carries the negation, exactly
  // as it does when both are `no` already.
  // Not in the prospective (A209): there the nominal stands inside the zu-group, so its "kein" would
  // negate the infinitive ("ist im Begriff, keine Maus zu fressen", about to eat no mouse), where the
  // verb's "nicht" negates the whole ahead of "im Begriff" (A19).
  // Only ever the clause's one negation: "kein" is "nicht + ein", so it can stand in for a single
  // "nicht" and never for two ("will kein Essen fressen" says one denial, whichever word carries it).
  // With two, the nominal keeps its determiner and both "nicht" stay in the Mittelfeld.
  const absorbs = negate && verbPhrase.aspect !== 'prospective';
  const keinObject = absorbs && takesKein(directObject);
  const keinPredicative = absorbs && !keinObject && takesKein(complements?.['predicative']?.phrase);
  // Any adverb in the Mittelfeld — a modal's or the main verb's — takes the "nicht immer" slot.
  const adverb = !!(modalAdverbs(verbPhrase.modals) || verbPhrase.modifier?.forms['base']);
  return {
    nicht: nichtSlots(keinObject || keinPredicative ? 0 : count,
      { prospective: verbPhrase.aspect === 'prospective', adverb, complements: leadsComplements }),
    // Per conjunct, as the complements are: a group mixing determiners keeps the ones that are not
    // negative ("die Maus und eine Katze"). A "kein" object is one conjunct by construction.
    directObject: directObject && (plainObject || keinObject)
      ? {
        ...directObject,
        conjuncts: directObject.conjuncts.map((np) =>
          keinObject ? withDefiniteness(np, 'no')
            : np.head.forms['definiteness'] === 'no' ? withDefiniteness(np, 'indefinite') : np),
      }
      : directObject,
    complements: keinPredicative ? withPredicativeKein(complements)
      : plainComplement ? withComplementDefiniteness(complements, 'indefinite') : complements,
  };
}

/**
 * Whether a noun slot can absorb the clause's "nicht" as "kein" (A182). One conjunct only — "kein"
 * cannot cover an indefinite and a definite conjunct at once ("eine Maus und das Essen") — holding an
 * `indefinite` or `bare` noun: the bare plural and the mass noun take "kein" as well ("keine Mäuse",
 * "kein Wasser"). A pronoun, a proper name and a predicate ADJECTIVE are not nominals "kein" can
 * determine ("frisst ihn nicht", "ist nicht müde").
 */
function takesKein(element: ResolvedNounElement | undefined): boolean {
  if (!element || element.conjuncts.length !== 1) return false;
  const forms = element.conjuncts[0].head.forms;
  return !forms['person'] && forms['proper'] !== '1' && forms['role'] !== 'adjective'
    && (forms['definiteness'] === 'indefinite' || forms['definiteness'] === 'bare');
}

/** The complements with the predicate nominal re-determined as "kein" (A182). */
function withPredicativeKein(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  const predicative = complements?.['predicative'];
  if (!complements || !predicative) return complements;
  return {
    ...complements,
    predicative: {
      ...predicative,
      phrase: { ...predicative.phrase, conjuncts: predicative.phrase.conjuncts.map((np) => withDefiniteness(np, 'no')) },
    },
  };
}
