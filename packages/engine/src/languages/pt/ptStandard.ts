import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { PT_DOMAIN, PT_STANDARD } from './pt.consts.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a predicate adjective — "do que o cão", "como o cão" — or '' where
 * the phrase has none (P09-E5). "do que" is fixed: its "do" does not agree with the standard, which
 * keeps its own article ("maior do que a gata", "do que os cães"). It leads the whole group. A
 * pronoun takes its **subject** form: "maior do que eu", "tão grande como ele", never "*do que mim".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition "de" (`PT_DOMAIN`), which contracts with each conjunct's article and so repeats per
 * conjunct ("o maior dos animais e dos homens", "da família"), and which, being a preposition,
 * governs a pronoun's **tonic** form: "de nós", fused in the 3rd person ("dele").
 */
export function ptStandard(np: ResolvedNounPhrase): string {
  if (np.standard && np.head.forms['domain'] === '1') {
    return coordinateElement(np.standard, (s) => prepObjectText(s, PT_DOMAIN));
  }
  const word = PT_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinateElement(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
