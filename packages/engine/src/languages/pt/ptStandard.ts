import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { PT_STANDARD } from './pt.consts.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a predicate adjective — "do que o cão", "como o cão" — or '' where
 * the phrase has none (P09-E5). "do que" is fixed: its "do" does not agree with the standard, which
 * keeps its own article ("maior do que a gata", "do que os cães"). It leads the whole group. A
 * pronoun takes its **subject** form: "maior do que eu", "tão grande como ele", never "*do que mim".
 */
export function ptStandard(np: ResolvedNounPhrase): string {
  const word = PT_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinateElement(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
