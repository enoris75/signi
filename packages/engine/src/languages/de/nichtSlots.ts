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
 * - before the complements, which belong to the predicate and so stand behind "nicht": a predicate
 *   complement ("ist nicht müde", "nicht müde sein") and a prepositional one alike ("geht nicht
 *   zum Markt", "ist nicht im Haus" — A159);
 * - otherwise after the objects ("isst die Maus nicht", "die Maus nicht essen"), which is where a
 *   bare-dative recipient stays too ("gibt dem Hund das Buch nicht").
 *
 * `negate` is the caller's decision that "nicht" is needed at all (a negative adverb or a "kein"
 * already negates); `complements` is its decision that there is such a constituent to lead (see
 * `hasPrepositionalComplement`). This only places it.
 */
export function nichtSlots(
  negate: boolean,
  { prospective = false, adverb, complements }: { prospective?: boolean; adverb: boolean; complements: boolean },
): NichtSlots {
  const slots: NichtSlots = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };
  if (negate) slots[prospective ? 'beforeAspect' : adverb ? 'beforeAdverb' : complements ? 'beforeComplements' : 'after'] = 'nicht';
  return slots;
}
