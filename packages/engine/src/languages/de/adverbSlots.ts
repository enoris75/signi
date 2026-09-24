import type { ConceptForms } from '../../types.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { negativeAdverb } from '../../functions/negativeAdverb.js';
import type { NichtSlots } from './de.types.js';

/**
 * Where the main verb's own adverb sits in the Mittelfeld, and where the "nicht" that leads it goes
 * with it.
 *
 * A manner or frequency adverb keeps the Mittelfeld's adverb slot, ahead of the objects ("verschiebt
 * schnell das Buch"). Where "nicht" leads that slot, a *known* object steps ahead of both and
 * `renderClause` splices it there — "verschiebt das Buch nicht schnell", never "verschiebt nicht
 * schnell das Buch" (A191); a quantified object stays behind them ("frisst nicht schnell alle
 * Mäuse"). A direction adverb (UP, DOWN) says where the object ends up, so it
 * follows the object and leads the other complements instead — "verschiebt das Buch nach oben", the
 * slot a direction complement takes (A142). "nicht" still leads it there ("verschiebt das Buch nicht
 * nach oben"), unless a modal's adverb holds the Mittelfeld slot, which comes first and keeps it.
 *
 * A focus adverb that scopes OVER the negation takes the other order in that same slot: German says
 * "noch nicht" and "auch nicht", never "nicht noch" (A244, A245). It is written ahead of the
 * "nicht" it shares the slot with, so the object still steps in front of both ("frisst das Essen
 * noch nicht"); with no "nicht" to lead, the adverb keeps its ordinary place.
 */
export function adverbSlots(
  modifier: ConceptForms | undefined,
  nicht: NichtSlots,
  modalAdverbs: string,
): { beforeObject: string; afterObject: string; nichtBeforeObject: string; nichtAfterObject: string } {
  const text = modifier?.forms['base'] ?? '';
  if (!isDirectionAdverb(modifier) && !isPlaceAdverb(modifier)) {
    const negAdverb = negativeAdverb(modifier, !!nicht.beforeAdverb);
    if (negAdverb?.slot === 'pre-negator') {
      // Its negative word where it has one: ALREADY's "schon" is "noch nicht" (P09-E28).
      return { beforeObject: '', afterObject: '', nichtBeforeObject: `${negAdverb.text} ${nicht.beforeAdverb}`, nichtAfterObject: '' };
    }
    return { beforeObject: text, afterObject: '', nichtBeforeObject: nicht.beforeAdverb, nichtAfterObject: '' };
  }
  const modalKeepsIt = !!modalAdverbs;
  return {
    beforeObject: '',
    afterObject: text,
    nichtBeforeObject: modalKeepsIt ? nicht.beforeAdverb : '',
    nichtAfterObject: modalKeepsIt ? '' : nicht.beforeAdverb,
  };
}
