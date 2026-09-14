import type { VerbComplex } from './de.types.js';
import { verbFinalCluster } from './verbFinalCluster.js';

/**
 * The prospective laid out from its "nicht" to the end of the clause. German builds it as the
 * predicate "im Begriff sein" governing a zu-infinitive group: an object pronoun, the main verb's
 * adverb, the other objects and complements, then "zu" + infinitive ("im Begriff, ihn immer zu sehen",
 * see `splitObject`). The group depends on the noun "Begriff" and stays whole, so
 * nothing of the clause lands inside it (Duden: "Er war im Begriff, das Haus zu verlassen").
 *
 * - Ahead of "im Begriff" sit the "nicht" that scopes over the whole prospective and the modals'
 *   adverbs, which belong to the modals: "muss nicht immer im Begriff sein".
 * - In V2 order the group follows the verb cluster: "ist im Begriff zu essen", "wird im Begriff sein
 *   zu essen", "muss im Begriff sein, die Maus zu essen".
 * - In verb-final order a bare "zu essen" stays inside the bracket, ahead of "sein" and the finite
 *   verb ("der im Begriff zu essen sein wird"). A longer group is extraposed after the finite verb
 *   ("der im Begriff ist, die Maus zu essen").
 *
 * A group holding more than the bare infinitive is set off by a leading comma, which `punctuate`
 * pulls onto the previous word. `verbFinal` also closes the cluster on the finite `v2`; in V2 order
 * the caller has already placed it.
 */
export function prospectiveFrame(
  complex: VerbComplex,
  { nicht, modalAdverbs, pronoun = '', adverb, dative, directObject, complements }: {
    nicht: string;
    modalAdverbs: string;
    pronoun?: string;
    adverb: string;
    dative: string;
    directObject: string;
    complements: string;
  },
  verbFinal: boolean,
): string[] {
  const { mid, tail, zuInfinitive } = complex;
  const own = [pronoun, adverb, dative, directObject, complements].filter(Boolean);
  const cluster = verbFinal ? verbFinalCluster(complex) : [tail];
  if (own.length === 0 && verbFinal) return [nicht, modalAdverbs, mid, zuInfinitive, ...cluster];
  const group = own.length === 0 ? zuInfinitive : `, ${[...own, zuInfinitive].join(' ')}`;
  return [nicht, modalAdverbs, mid, ...cluster, group];
}
