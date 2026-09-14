import type { DimensionRelation } from '@signi/shared';
import type { ConceptForms } from '../types.js';

/**
 * The dimension relation a noun heads an adjective-definition gloss with ("great **in** size",
 * "high **of** quality") — a property of the noun's meaning, read from its resolved forms. A noun
 * that declares none is an `extent` ("in …"), the neutral case. Each engine maps the relation to
 * its own adposition, exactly as `mannerRelation` does for the manner adverbial.
 */
export function dimensionRelation(forms: ConceptForms['forms']): DimensionRelation {
  const r = forms['dimensionRelation'];
  return r === 'quality' || r === 'measure' ? r : 'extent';
}
