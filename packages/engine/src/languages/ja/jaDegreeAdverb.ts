import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { JA_DEGREE } from './ja.consts.js';

/**
 * The prenominal degree adverb an adjective takes (もっと大きい, 最も大きい), or '' for none. An
 * intensifier in its comparative form already says "more" — ずっと大きい is "much bigger" — so もっと
 * gives way to it rather than doubling it (never ずっともっと大きい; see `applyIntensifier`, A248). So
 * does TOO's 〜すぎる, which on a comparative marks itself the same way: 大きすぎる (A256).
 */
export function jaDegreeAdverb(a: ConceptForms): string {
  const degree = adjDegree(a);
  if (degree === 'more' && a.forms['intensifier_comparative'] === '1') return '';
  return JA_DEGREE[degree];
}
