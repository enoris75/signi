import type { ConceptForms, ResolvedVerbPhrase } from '../types.js';

/**
 * The four places a verb's adverb can stand, which is what decides where each of several goes (P15):
 *
 *  - `frequency` — ALWAYS, ALREADY, NEVER, the focus adverbs, and a sentence adverb that stays in its
 *    clause (see `asFrequencyAdverb`): inside the verb group.
 *  - `manner` — FAST, WELL, NOW, any adverb with no subtype: the clause's trailing slot.
 *  - `direction` — UP, DOWN: a particle at the head of the complements ([`isDirectionAdverb`](./isDirectionAdverb.ts)).
 *  - `place` — HERE, EVERYWHERE: among the complements, where a locative stands ([`isPlaceAdverb`](./isPlaceAdverb.ts)).
 */
export type AdverbClass = 'frequency' | 'manner' | 'direction' | 'place';

export function adverbClass(a: ConceptForms): AdverbClass {
  const subtype = a.forms['subtype'];
  if (subtype === 'frequency' || subtype === 'sentence') return 'frequency';
  if (subtype === 'direction' || subtype === 'place') return subtype;
  return 'manner';
}

/**
 * The verb's adverbs of one class after its primary `modifier` (see `ResolvedVerbPhrase.moreAdverbs`),
 * in the order the plan gave them. Each engine places them where that class goes: a frequency one
 * right after the primary, which is then always a frequency adverb too; a manner one in the trailing
 * slot, after a manner primary; a direction or place one among the complements.
 */
export function moreAdverbsOf(vp: Pick<ResolvedVerbPhrase, 'moreAdverbs'> | undefined, cls: AdverbClass): ConceptForms[] {
  return (vp?.moreAdverbs ?? []).filter((a) => adverbClass(a) === cls);
}

/**
 * `moreAdverbsOf` spelled: each adverb's `spell` (by default its `base`), joined with `separator`.
 * Spanish and Portuguese pass their agreeing surface, Japanese joins with no space.
 */
export function moreAdverbText(
  vp: Pick<ResolvedVerbPhrase, 'moreAdverbs'> | undefined,
  cls: AdverbClass,
  spell: (a: ConceptForms) => string = (a) => a.forms['base'] ?? '',
  separator = ' ',
): string {
  return moreAdverbsOf(vp, cls).map(spell).filter(Boolean).join(separator);
}

/**
 * Every adverb of a verb phrase that has no clause of its own to place them in — an instrument's act,
 * "by choosing a word" (A387) — in the order they are said: the primary, then its extras class by
 * class, frequency, place, direction, manner. The engines say them where they say the primary.
 */
export function allAdverbs(vp: Pick<ResolvedVerbPhrase, 'modifier' | 'moreAdverbs'>): ConceptForms[] {
  const classes: AdverbClass[] = ['frequency', 'place', 'direction', 'manner'];
  return [...(vp.modifier ? [vp.modifier] : []), ...classes.flatMap((cls) => moreAdverbsOf(vp, cls))];
}
