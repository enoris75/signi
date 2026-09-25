import { adverbClass } from '../../functions/adverbClass.js';
import type { ConceptForms } from '../../types.js';

// The primary adverb is the one whose class carries the most grammar: a negative adverb drives the
// clause's negation and concord, and a frequency adverb has a slot in every branch of every engine.
const RANK = { frequency: 1, manner: 2, direction: 3, place: 4 } as const;

const rank = (a: ConceptForms): number => (a.forms['polarity'] === 'negative' ? 0 : RANK[adverbClass(a)]);

/**
 * Split a verb's adverbs (P15) into the **primary** `modifier` every engine already places and the
 * `moreAdverbs` it places by class after it (see `ResolvedVerbPhrase.moreAdverbs`).
 *
 * The primary is the highest-ranked adverb, the plan's first among equals: a negative one, else a
 * frequency one, else manner, direction, place. So an extra frequency adverb always has a frequency
 * primary to stand beside, and a lone adverb is the primary it always was.
 *
 * Only the first negative adverb is kept: "never no longer runs" is not a sentence in any of the seven,
 * and negation and concord read one (P15 D3).
 */
export function verbAdverbs(adverbs: ConceptForms[]): { modifier?: ConceptForms; moreAdverbs?: ConceptForms[] } {
  let negative = false;
  const kept = adverbs.filter((a) => {
    if (a.forms['polarity'] !== 'negative') return true;
    if (negative) return false;
    return (negative = true);
  });
  if (kept.length === 0) return {};
  const primary = kept.reduce((best, a) => (rank(a) < rank(best) ? a : best));
  const more = kept.filter((a) => a !== primary);
  return { modifier: primary, ...(more.length > 0 ? { moreAdverbs: more } : {}) };
}
