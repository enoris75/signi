import type { Degree } from '@signi/shared';
import type { ConceptForms } from '../types.js';
import { adjDegree } from './adjDegree.js';

/**
 * The adverb an adjective's degree writes in front of it, from the language's `*_DEGREE` table —
 * or, where a standard of comparison follows (`forms['standard']`, P09-E5), from its
 * `*_STANDARD_DEGREE` table first. The two differ only for the equative, whose adverb becomes the
 * first half of a circumfix: "equally big" but "**as** big as the dog", it *ugualmente* but *tanto
 * … quanto*, es *igual de* but *tan … como*, pt *igualmente* but *tão … como*. A degree the second
 * table leaves out keeps its plain word (*più grande del cane*), and a bare degree is untouched.
 */
export function degreeAdverb(
  a: ConceptForms,
  table: Record<Degree, string>,
  withStandard: Partial<Record<Degree, string>> = {},
): string {
  const degree = adjDegree(a);
  return (a.forms['standard'] === '1' ? withStandard[degree] : undefined) ?? table[degree];
}
