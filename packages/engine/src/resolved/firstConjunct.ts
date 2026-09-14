import type { ResolvedNounElement, ResolvedNounPhrase } from '../types.js';

/** The first conjunct of an element — the head of a slot the engines treat as a single phrase. */
export function firstConjunct(element: ResolvedNounElement): ResolvedNounPhrase {
  return element.conjuncts[0];
}
