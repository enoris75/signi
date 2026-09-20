import type { ConceptForms } from '../../types.js';
import { isDirectionAdverb } from '../../functions/isDirectionAdverb.js';
import type { NichtSlots } from './de.types.js';

/**
 * Where the main verb's own adverb sits in the Mittelfeld, and where the "nicht" that leads it goes
 * with it.
 *
 * A manner or frequency adverb keeps the Mittelfeld's adverb slot, ahead of the objects ("verschiebt
 * nicht schnell das Buch"). A direction adverb (UP, DOWN) says where the object ends up, so it
 * follows the object and leads the other complements instead — "verschiebt das Buch nach oben", the
 * slot a direction complement takes (A142). "nicht" still leads it there ("verschiebt das Buch nicht
 * nach oben"), unless a modal's adverb holds the Mittelfeld slot, which comes first and keeps it.
 */
export function adverbSlots(
  modifier: ConceptForms | undefined,
  nicht: NichtSlots,
  modalAdverbs: string,
): { beforeObject: string; afterObject: string; nichtBeforeObject: string; nichtAfterObject: string } {
  const text = modifier?.forms['base'] ?? '';
  if (!isDirectionAdverb(modifier)) {
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
