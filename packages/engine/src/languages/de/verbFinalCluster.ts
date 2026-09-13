import type { VerbComplex } from './de.types.js';

/**
 * The verbs that close a verb-final clause, in order. The finite verb follows the non-finite tail
 * ("der das Buch essen wird", "der die Maus gesehen hat"), except over a double infinitive, where
 * the finite werden/würde leads the whole cluster: "der das Buch wird essen müssen", "wenn der Kater
 * die Maus würde essen müssen". Empty parts are left for the caller to filter.
 */
export function verbFinalCluster({ v2, tail, finiteLeadsTail }: VerbComplex): string[] {
  return finiteLeadsTail ? [v2, tail] : [tail, v2];
}
