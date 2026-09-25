import type { NichtSlots } from './gsw.types.js';

/** The clause negator, Swiss German *nöd* for *nicht* (P10-E6 D1; *nid* is Bernese, *nit* Basel). */
export const NEGATOR = 'nöd';

/**
 * Where a negating "nicht" sits in the Mittelfeld: at most one slot holds them, the rest are empty,
 * so a clause builder splices all four into its word order. Every clause order that negates with
 * "nicht" shares the rule — the declarative, the verb-final protasis, the command, the instruction
 * and the infinitive:
 *
 * - before the prospective's "im Begriff", which it scopes over as a whole ("ist nicht im Begriff zu
 *   essen", never "im Begriff nicht zu essen");
 * - before a Mittelfeld adverb, whoever it belongs to ("isst nicht immer", "iss nicht schnell",
 *   "nicht immer essen") — a slot the clause builder splices *behind* a known object, which keeps
 *   the place it holds without the adverb ("isst die Maus nicht immer", A191);
 * - before the complements, which belong to the predicate and so stand behind "nicht": a predicate
 *   complement ("ist nicht müde", "nicht müde sein") and a prepositional one alike ("geht nicht
 *   zum Markt", "ist nicht im Haus" — A159);
 * - otherwise after the objects ("isst die Maus nicht", "die Maus nicht essen"), which is where a
 *   bare-dative recipient stays too ("gibt dem Hund das Buch nicht").
 *
 * `count` is how many "nicht" the caller has decided the clause places — 0 for none (a negative
 * adverb already negates, and an indefinite nominal absorbs it as "kein" — A182), and more than one
 * when several words of the verb group are denied at once (A03): the finite element's, the main
 * verb's under a modal, and each inner modal's all stand in this one slot, the finite one first,
 * "ich will nicht nicht gehen". `complements` is the caller's decision that there is such a
 * constituent to lead (see `hasPrepositionalComplement`). This only places them.
 */
export function nichtSlots(
  count: number,
  { prospective = false, adverb, complements }: { prospective?: boolean; adverb: boolean; complements: boolean },
): NichtSlots {
  const slots: NichtSlots = { beforeAspect: '', beforeAdverb: '', beforeComplements: '', after: '' };
  if (count > 0) {
    slots[prospective ? 'beforeAspect' : adverb ? 'beforeAdverb' : complements ? 'beforeComplements' : 'after'] =
      Array.from({ length: count }, () => NEGATOR).join(' ');
  }
  return slots;
}
