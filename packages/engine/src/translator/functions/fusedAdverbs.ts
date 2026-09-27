import type { ConceptForms } from '../../types.js';

/**
 * Fold a primary adverb and the partner its lexeme names into the one word a language has for the
 * pair: NEVER + AGAIN is *mai più*, *plus jamais*, *nie wieder*, *nunca más*, *nunca mais*, 二度と
 * (A384), where the two words side by side read "never anew". The lexeme names both: `fuses_with`
 * the partner's concept id, `fused` the word (with `fused_reading` for a kanji one). The fused word
 * takes the primary's slot, polarity and class, and the partner leaves the extras.
 *
 * A language whose lexeme names no partner keeps both words: English *never runs again*. A question
 * that is not denied keeps them too, since its NEVER is the positive *ever* (`interrogativeAdverb`),
 * which has no such pair.
 */
export function fusedAdverbs(
  modifier: ConceptForms | undefined,
  moreAdverbs: ConceptForms[] | undefined,
): { modifier?: ConceptForms; moreAdverbs?: ConceptForms[] } {
  const partnerId = modifier?.forms['fuses_with'];
  const fused = modifier?.forms['fused'];
  const partner = partnerId && fused ? moreAdverbs?.find((a) => a.conceptId === partnerId) : undefined;
  if (!modifier || !partner || !fused) return { modifier, moreAdverbs };
  const {
    fuses_with: _with,
    fused: _fused,
    fused_reading: reading,
    reading: _reading,
    interrogative: _interrogative,
    interrogative_reading: _interrogativeReading,
    ...rest
  } = modifier.forms;
  const more = moreAdverbs!.filter((a) => a !== partner);
  return {
    modifier: { ...modifier, forms: { ...rest, base: fused, ...(reading ? { reading } : {}) } },
    ...(more.length > 0 ? { moreAdverbs: more } : {}),
  };
}
