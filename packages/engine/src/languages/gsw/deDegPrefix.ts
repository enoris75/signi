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
  if (d === 'least') return `${intensifier}am wenigschte `;
  // Before a standard the equative is the circumfix "so … wie" ("so groß wie der Hund"); "gleich groß"
  // is the bare equative, which says the two are alike without naming the other (P09-E5). An
  // equative intensifier replaces either: "genauso groß (wie der Hund)" (see `applyIntensifier`, A255).
  if (d === 'equally') {
    if (a.forms['intensifier_equative'] === '1') return intensifier;
    return `${intensifier}${a.forms['standard'] === '1' ? 'so' : 'gliich'} `;
  }
  return intensifier;
}
