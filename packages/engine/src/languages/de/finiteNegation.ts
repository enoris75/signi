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
 * - otherwise the verb's "nicht", which `nichtSlots` places.
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
  const negate = neg.verb && !neg.adverb && !neg.subject && !neg.object && !neg.complement;
  // What already negates ahead of the postverbal phrases, and so takes their "kein" away.
  const negatedAhead = neg.subject || neg.adverb;
  const plainObject = neg.object && negatedAhead;
  const plainComplement = neg.complement && (negatedAhead || neg.object);
  // Any adverb in the Mittelfeld — a modal's or the main verb's — takes the "nicht immer" slot.
  const adverb = !!(modalAdverbs(verbPhrase.modals) || verbPhrase.modifier?.forms['base']);
  return {
    nicht: nichtSlots(negate, { prospective: verbPhrase.aspect === 'prospective', adverb, complements: leadsComplements }),
    // Per conjunct, as the complements are: a group mixing determiners keeps the ones that are not
    // negative ("die Maus und eine Katze").
    directObject: directObject && plainObject
      ? {
        ...directObject,
        conjuncts: directObject.conjuncts.map((np) =>
          np.head.forms['definiteness'] === 'no' ? withDefiniteness(np, 'indefinite') : np),
      }
      : directObject,
    complements: plainComplement ? withComplementDefiniteness(complements, 'indefinite') : complements,
  };
}
