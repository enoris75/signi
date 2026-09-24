import type { ConceptForms } from '../../types.js';

/**
 * Put a **negative-polarity adverb** into its question form where the clause asks and is not
 * denied: NEVER is *ever* / *mai* / *déjà* / *je* / *alguna vez* / *alguma vez* / いつか there — "has
 * the cat ever eaten?", not "has the cat never eaten?" (P09-E28 D3). It is `negativePolarity`'s
 * mirror: that one swaps an indefinite pronoun under a negation, this one swaps a negative adverb
 * out of it.
 *
 * The lexeme names the surface (`interrogative`), which keeps the adverb's own slot. The swapped
 * adverb is a positive word: its `polarity` goes, so no engine builds a negation around it, and so
 * does a `reading` the new surface does not share (いつか is kana; `interrogative_reading` names one
 * where it is not).
 *
 * A lexeme with no interrogative form, a clause that does not ask, and a negated question ("does the
 * cat never eat?", a denial the plan spells with `negative`) come back untouched.
 */
export function interrogativeAdverb(
  modifier: ConceptForms | undefined,
  question: boolean,
  negative: boolean,
): ConceptForms | undefined {
  const surface = modifier?.forms['interrogative'];
  if (!modifier || !surface || !question || negative) return modifier;
  const {
    polarity: _polarity,
    reading: _reading,
    interrogative: _interrogative,
    interrogative_reading: reading,
    ...rest
  } = modifier.forms;
  return { ...modifier, forms: { ...rest, base: surface, ...(reading ? { reading } : {}) } };
}
