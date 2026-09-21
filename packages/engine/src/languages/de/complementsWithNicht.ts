import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../../types.js';
import { complementsParts } from './complementsPhrase/index.js';

/**
 * The Mittelfeld's complements with the clause's "nicht" in its place among them.
 *
 * "nicht" leads the complements, which belong to the predicate and so stand behind it: "geht nicht
 * zum Markt", "ist nicht im Haus" (A159). A *predicate* complement is the exception. German closes
 * the Mittelfeld with it, against the verb cluster (A186), and sentence negation stands right
 * before it: "ist wegen des Hundes nicht müde", "scheint wegen des Hundes nicht müde". Ahead of the
 * adjuncts instead — "ist nicht wegen des Hundes müde" — the same "nicht" reads as a constituent
 * negation of the adjunct, "not *because of the dog*", which is a different sentence.
 *
 * `lead` is whatever the clause puts before its complements in that slot (the elided place's "da", a
 * prepositional object); it goes with the adjuncts.
 */
export function complementsWithNicht(
  lead: string[],
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  verb: ConceptForms['forms'],
  nicht: string,
): string {
  const { adjuncts, predicate } = complementsParts(complements, verb);
  // German spells a clause's "nicht" and a denied cause's own in the same slot (see
  // `Complement.negative`). With a predicate they stay apart, one at each end of the adjuncts, and
  // the sentence says both: "ist nicht wegen des Hundes nicht müde". With no predicate to anchor the
  // clause's, the two land side by side — "läuft nicht nicht wegen des Hundes", which is not German.
  // One "nicht" carries both readings there; telling them apart would need the "sondern" clause the
  // plan has no room for.
  const clauseNicht = !predicate && nicht && adjuncts.startsWith(`${nicht} `) ? '' : nicht;
  const parts = predicate ? [...lead, adjuncts, nicht, predicate] : [clauseNicht, ...lead, adjuncts];
  return parts.filter(Boolean).join(' ');
}
