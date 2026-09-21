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
  const parts = predicate ? [...lead, adjuncts, nicht, predicate] : [nicht, ...lead, adjuncts];
  return parts.filter(Boolean).join(' ');
}
