import type { ResolvedRelativeClause } from '../types.js';

/**
 * Whether a relative clause's **own** subject is a `no` phrase, which negates the relative clause and
 * takes its other negatives with it, as a main clause's does: "the mouse that no cat eats", "il topo
 * che nessun gatto mangia" (A160, A166). It is the `subjectIsNegative` every engine's relative call
 * site passes (see `negationSources`), asked here once rather than off the forms each engine is handed.
 *
 * Two relatives have no such subject, and so answer `false`:
 *
 * - a **subject** relative, whose head stands in for the subject and is handed to the predicate for
 *   agreement. A `no` head negates the MATRIX clause, not the relative one: "no cat that does not eat
 *   runs", "nessun gatto che non mangia corre" (A167);
 * - a **genitive** relative, whose possessed phrase gives its determiner up to the possessive
 *   relativizer ("whose cat", "il cui gatto", "dessen Kater"), so its `no` never reaches the surface.
 */
export function relativeSubjectIsNegative(rel: ResolvedRelativeClause): boolean {
  if (!rel.subject || rel.headRole === 'subject' || rel.headRole === 'possessor') return false;
  return rel.subject.agreement['definiteness'] === 'no';
}
