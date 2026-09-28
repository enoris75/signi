import type { ResolvedVerbPhrase } from '../../types.js';
import { FREQUENTATIVE_ADVERBS } from './lt.consts.js';

/**
 * Whether a past verb takes the **frequentative past** (P18 §0.3, Lithuanian's one extra cell): a
 * plain indicative past with an adverb of habit (*visada valgydavo*, *dažnai valgydavo*), the
 * progressive and the neutral past both. A negative adverb keeps the simple past (*niekada nevalgė*),
 * as the adverb already says the habit (verify: *niekada nevalgydavo* is heard too).
 */
export function isFrequentative(vp: ResolvedVerbPhrase): boolean {
  if ((vp.tense ?? 'present') !== 'past' || (vp.mood !== undefined && vp.mood !== 'indicative')) return false;
  const aspect = vp.aspect ?? 'neutral';
  if (aspect !== 'neutral' && aspect !== 'progressive') return false;
  const adverbs = [vp.modifier, ...(vp.moreAdverbs ?? [])];
  return adverbs.some((a) => a && FREQUENTATIVE_ADVERBS.has(a.conceptId));
}
