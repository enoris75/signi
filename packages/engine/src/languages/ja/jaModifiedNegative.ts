import type { ResolvedNounPhrase } from '../../types.js';

/**
 * How Japanese says a **negated indefinite pronoun with an adjective** (P09-E36), or undefined when
 * the phrase is not one. The positive stands on the ordinary path, the adjective before the pronoun
 * (大きい何か, 新しい誰か), but *大きい何も is no Japanese: 何 / 誰 cannot take a modifier inside the
 * も…ない circumfix. The two natural shapes are:
 *
 * - `'modified'` — the adjective goes on a plain noun, the pronoun's `negative_modified` (もの for
 *   SOMETHING, 人 for SOMEONE), which takes the case particle, and the negative word follows with
 *   its も: 猫は大きいものを何も食べません ("eats nothing big"), 新しい人は誰も走りません. See `npSegs` for
 *   the noun and `jaParticleSegs` for the tail.
 * - `'else'` — OTHER is not an adjective here at all but the adverb ほかに (`before_negative_pronoun`)
 *   before the negative word: 猫はほかに何も食べません ("eats nothing else"), ほかに誰も走りません.
 */
export function jaModifiedNegative(np: ResolvedNounPhrase): 'modified' | 'else' | undefined {
  const f = np.head.forms;
  if (!f['person'] || f['definiteness'] !== 'no' || np.adjectives.length === 0 || !f['negative_modified']) return undefined;
  return np.adjectives.every((a) => a.forms['before_negative_pronoun']) ? 'else' : 'modified';
}
