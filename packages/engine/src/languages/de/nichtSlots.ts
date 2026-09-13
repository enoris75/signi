import type { NichtSlots } from './de.types.js';

/**
 * Where a negating "nicht" sits in the Mittelfeld: at most one slot holds it, the rest are empty, so
 * a clause builder splices all four into its word order. Every clause order that negates with
 * "nicht" shares the rule — the declarative, the verb-final protasis, the command, the instruction
 * and the infinitive:
 *
 * - before the prospective's "im Begriff", which it scopes over as a whole ("ist nicht im Begriff zu
 *   essen", never "im Begriff nicht zu essen");
 * - before a Mittelfeld adverb, whoever it belongs to ("isst nicht immer", "iss nicht schnell",
 *   "nicht immer essen");
 * - before a predicate complement ("ist nicht müde", "nicht müde sein");
 * - otherwise after the objects and complements ("isst die Maus nicht", "die Maus nicht essen").
 *
 * `negate` is the caller's decision that "nicht" is needed at all (a negative adverb or a "kein"
 * already negates); this only places it.
 */
export function nichtSlots(
  negate: boolean,
  { prospective = false, adverb, predicative }: { prospective?: boolean; adverb: boolean; predicative: boolean },
): NichtSlots {
  const slots: NichtSlots = { beforeAspect: '', beforeAdverb: '', beforePredicative: '', after: '' };
  if (negate) slots[prospective ? 'beforeAspect' : adverb ? 'beforeAdverb' : predicative ? 'beforePredicative' : 'after'] = 'nicht';
  return slots;
}
