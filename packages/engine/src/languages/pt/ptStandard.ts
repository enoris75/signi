import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { PT_DOMAIN, PT_STANDARD } from './pt.consts.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a compared adjective `adj` — "do que o cão", "como o cão" — or ''
 * where it has none (P09-E5). "do que" is fixed: its "do" does not agree with the standard, which
 * keeps its own article ("maior do que a gata", "do que os cães"). It leads the whole group. A
 * pronoun takes its **subject** form: "maior do que eu", "tão grande como ele", never "*do que mim".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition "de" (`PT_DOMAIN`), which contracts with each conjunct's article and so repeats per
 * conjunct ("o maior dos animais e dos homens", "da família"), and which, being a preposition,
 * governs a pronoun's **tonic** form: "de nós", fused in the 3rd person ("dele").
 *
 * `adj` is the predicate adjective or an attributive one (P09-E18): "um gato maior do que o cão".
 */
export function ptStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  if (!standard) return '';
  if (adj.forms['domain'] === '1') return coordinateElement(standard, (s) => prepObjectText(s, PT_DOMAIN));
  const word = PT_STANDARD[adjDegree(adj)];
  if (!word) return '';
  return `${word} ${coordinateElement(standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
