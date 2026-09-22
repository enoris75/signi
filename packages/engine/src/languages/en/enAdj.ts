import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { EN_DEGREE, EN_IRREGULAR } from './en.consts.js';
import { inflect } from './inflect.js';
import { inflects } from './inflects.js';

/**
 * One adjective's surface at its degree: inflected where English inflects ("bigger",
 * "the best"), periphrastic otherwise ("more beautiful"). "less"/"least"/"equally" are
 * always periphrastic — English has no inflected downward comparison.
 *
 * An intensifier leads whatever comes out ("very big", "much bigger"; see `withIntensifier`, C33).
 */
export function enAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  const degree = adjDegree(a);
  if (!base) return '';
  if (degree === 'more' || degree === 'most') {
    const irregular = EN_IRREGULAR[base];
    if (irregular) return withIntensifier(a, degree === 'more' ? irregular[0] : irregular[1]);
    // A two-syllable adjective the lexicon marks `inflects` compares with -er/-est ("cleverer").
    if (inflects(base, a.forms['inflects'] === '1')) return withIntensifier(a, inflect(base, degree === 'more' ? 'er' : 'est'));
  }
  const d = EN_DEGREE[degree];
  return withIntensifier(a, d ? `${d} ${base}` : base);
}
