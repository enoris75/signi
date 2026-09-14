import type { Degree } from '@signi/shared';
import type { ConceptForms } from '../types.js';

/**
 * The comparative degree threaded onto a resolved adjective's forms (see the translator).
 * Absent ⇒ the plain, unmarked `positive` form. Each engine maps this to its own degree
 * words / morphology.
 */
export function adjDegree(a: ConceptForms): Degree {
  return (a.forms['degree'] as Degree | undefined) ?? 'positive';
}
