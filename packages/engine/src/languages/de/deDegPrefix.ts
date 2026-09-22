import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';

/**
 * Invariant adverbs placed before the declined adjective: the periphrastic degrees, and an
 * intensifier outside them ("sehr großer", "zu großer", "sehr weniger schöner"). German writes
 * every one of them in front, undeclined, so they stack as one prefix (C33).
 */
export function deDegPrefix(a: ConceptForms): string {
  const intensifier = a.forms['intensifier'] ? `${a.forms['intensifier']} ` : '';
  const d = adjDegree(a);
  if (d === 'less') return `${intensifier}weniger `;
  if (d === 'least') return `${intensifier}am wenigsten `;
  if (d === 'equally') return `${intensifier}gleich `;
  return intensifier;
}
