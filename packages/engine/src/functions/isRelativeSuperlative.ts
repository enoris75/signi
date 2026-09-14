import type { ConceptForms } from '../types.js';
import { adjDegree } from './adjDegree.js';

/**
 * The two relative-superlative degrees ("most"/"least"). Romance renders these with the same degree
 * adverb as the comparative ("più"/"plus"/"más"/"mais"), so an *attributive* superlative leans on
 * the noun's own definite article to tell them apart. A *predicative* one has no such article, so it
 * must supply its own — the caller keys that off this.
 */
export function isRelativeSuperlative(a: ConceptForms): boolean {
  const d = adjDegree(a);
  return d === 'most' || d === 'least';
}
