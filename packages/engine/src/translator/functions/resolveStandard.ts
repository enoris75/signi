import type { NounPhrase } from '@signi/shared';
import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { STANDARD_DEGREES } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';

/**
 * Resolve the standard of comparison of an adjective head ("bigger **than the dog**", P09-E5), or
 * nothing where there is none to render.
 *
 * A standard needs an adjective head and a degree that compares with something: `more`, `less` or
 * `equally` (`STANDARD_DEGREES`). On `positive` there is nothing to compare, and on `most` / `least`
 * the superlative selects from a set with a partitive — "the biggest **of** the cats" — which a
 * *than* would turn into "the biggest than the cats" in six languages (D3). So the translator drops
 * it there, once for every language, and the plain degree renders exactly as it would without one.
 *
 * A standard that survives marks the head `standard: '1'`: the equative's degree adverb is the
 * first half of a circumfix once a standard follows (it *ugualmente* → *tanto … quanto*, de *gleich*
 * → *so … wie*), and the degree renderers see only the head's forms.
 */
export function resolveStandard(
  np: NounPhrase,
  head: ConceptForms,
  language: string,
  lookup: LexiconLookup,
): ResolvedNounElement | undefined {
  if (!np.headStandard || head.forms['role'] !== 'adjective') return undefined;
  if (!STANDARD_DEGREES.has(np.headDegree ?? 'positive')) return undefined;
  head.forms['standard'] = '1';
  return resolveNounElement(np.headStandard, language, lookup);
}
