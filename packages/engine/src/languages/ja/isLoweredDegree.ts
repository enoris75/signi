import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';

/** True for the lowered degrees, which Japanese realises by negating the adjective. */
export function isLoweredDegree(concept: ConceptForms): boolean {
  const d = adjDegree(concept);
  return d === 'less' || d === 'least';
}
