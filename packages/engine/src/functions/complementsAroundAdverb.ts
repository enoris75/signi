import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../types.js';
import { isDirectionAdverb } from './isDirectionAdverb.js';
import { isPlaceAdverb } from './isPlaceAdverb.js';

type Complements = Partial<Record<ComplementType, ResolvedComplement>>;

/**
 * The complements slot with the verb's own adverb seated inside it, for the five languages that
 * render the predicate before its complements (English and the four Romance).
 *
 * A direction adverb (UP, DOWN) is a particle of the verb, so it leads the whole slot: a complement
 * standing before it joins itself to the object instead ("*moves the book in the house up") — A156.
 *
 * An adverb of place (EVERYWHERE) says where the action happens, as a locative complement does, so
 * it takes the locative's place in `COMPLEMENT_RENDER_ORDER` — after the predicate, the recipient
 * and the rest, just ahead of a locative and of the causal adjunct: "seems tired everywhere",
 * "gives the book to the dog everywhere", "runs everywhere in the house", "eats the mouse everywhere
 * because of the dog" (A189).
 *
 * Any other adverb has a slot of its own outside the complements, so the slot is the complements
 * alone — as it is for an empty `adverbText`, which is how a caller says the adverb has already been
 * spelled somewhere else. `adverbText` comes from the caller because Spanish and Portuguese agree an
 * adverb's surface with the subject. `render` is the caller's own `complementsPhrase`, bound to its
 * other arguments; it is called twice for a place adverb, once per side of the split, and every
 * complement renders independently of its neighbours.
 */
export function complementsAroundAdverb(
  modifier: ConceptForms | undefined,
  adverbText: string,
  complements: Complements | undefined,
  render: (complements?: Complements) => string,
): string {
  if (!adverbText) return render(complements);
  if (isDirectionAdverb(modifier)) return [adverbText, render(complements)].filter(Boolean).join(' ');
  if (!isPlaceAdverb(modifier)) return render(complements);
  const locative = COMPLEMENT_RENDER_ORDER.indexOf('locative');
  const before: Complements = {};
  const after: Complements = {};
  COMPLEMENT_RENDER_ORDER.forEach((type, i) => {
    const c = complements?.[type];
    if (c) (i < locative ? before : after)[type] = c;
  });
  return [render(before), adverbText, render(after)].filter(Boolean).join(' ');
}
