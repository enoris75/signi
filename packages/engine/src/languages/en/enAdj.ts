import { adjDegree, type ConceptForms } from '../../types.js';
import { EN_DEGREE, EN_IRREGULAR } from './en.consts.js';
import { inflect } from './inflect.js';
import { inflects } from './inflects.js';

/**
 * One adjective's surface at its degree: inflected where English inflects ("bigger",
 * "the best"), periphrastic otherwise ("more beautiful"). "less"/"least"/"equally" are
 * always periphrastic — English has no inflected downward comparison.
 */
export function enAdj(a: ConceptForms): string {
  const base = a.forms['base'] ?? '';
  const degree = adjDegree(a);
  if (!base) return '';
  if (degree === 'more' || degree === 'most') {
    const irregular = EN_IRREGULAR[base];
    if (irregular) return degree === 'more' ? irregular[0] : irregular[1];
    if (inflects(base)) return inflect(base, degree === 'more' ? 'er' : 'est');
  }
  const d = EN_DEGREE[degree];
  return d ? `${d} ${base}` : base;
}
