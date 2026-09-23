import type { NounPhrase } from '@signi/shared';
import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { STANDARD_DEGREES, SUPERLATIVE_DEGREES } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';

/**
 * Resolve what an adjective head's degree measures it against, or nothing where there is none to
 * render: the **standard** of a comparison ("bigger **than the dog**", P09-E5) or the **set** a
 * superlative selects from ("the biggest **of the animals**", P09-E19). Both ride on `headStandard`.
 *
 * It needs an adjective head and a degree that measures against something. The comparatives and the
 * equative (`STANDARD_DEGREES`) take a standard, and mark the head `standard: '1'`: the equative's
 * degree adverb is the first half of a circumfix once a standard follows (it *ugualmente* → *tanto …
 * quanto*, de *gleich* → *so … wie*), and the degree renderers see only the head's forms. The
 * superlatives (`SUPERLATIVE_DEGREES`) take a set, and mark the head `domain: '1'` instead — never
 * `standard`, so the equative's adverb swap cannot fire on them; each engine reads it to say its
 * partitive word (of / in, di, de / d'entre, the genitive / von, de, de, の中で) and English and German
 * the article the set forces ("is **the** biggest of the animals", "ist **das** größte der Tiere").
 * On `positive` there is nothing to measure against, and the translator drops it, once for every
 * language, so the plain degree renders exactly as it would without one.
 */
export function resolveStandard(
  np: NounPhrase,
  head: ConceptForms,
  language: string,
  lookup: LexiconLookup,
): ResolvedNounElement | undefined {
  if (!np.headStandard || head.forms['role'] !== 'adjective') return undefined;
  const degree = np.headDegree ?? 'positive';
  const domain = SUPERLATIVE_DEGREES.has(degree);
  if (!domain && !STANDARD_DEGREES.has(degree)) return undefined;
  head.forms[domain ? 'domain' : 'standard'] = '1';
  return resolveNounElement(np.headStandard, language, lookup);
}
