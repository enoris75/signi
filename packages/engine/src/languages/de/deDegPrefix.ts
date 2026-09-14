import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';

/** Invariant adverb placed before the declined adjective for the periphrastic degrees. */
export function deDegPrefix(a: ConceptForms): string {
  const d = adjDegree(a);
  if (d === 'less') return 'weniger ';
  if (d === 'least') return 'am wenigsten ';
  if (d === 'equally') return 'gleich ';
  return '';
}
