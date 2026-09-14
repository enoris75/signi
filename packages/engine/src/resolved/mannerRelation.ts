import type { MannerRelation } from '@signi/shared';
import type { ConceptForms } from '../types.js';

/**
 * The manner relation a noun heads a `manner` adverbial with — a property of the noun's meaning,
 * read from its resolved forms (threaded there from the concept). A noun that declares none is a
 * `similative` ("like …"), the neutral case that reads for any noun. Each engine maps the
 * relation to its own adposition.
 */
export function mannerRelation(forms: ConceptForms['forms']): MannerRelation {
  const r = forms['mannerRelation'];
  return r === 'means' || r === 'measure' || r === 'mode' ? r : 'similative';
}
