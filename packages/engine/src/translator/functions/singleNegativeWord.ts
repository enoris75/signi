import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedPhrase } from '../../types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';

/**
 * The languages with no **negative concord**: one negative word denies the clause, and a second one
 * would deny it again. German says "der Kater gibt niemandem etwas", "niemand läuft mit jemandem",
 * never "*gibt niemandem nichts" (A308 follow-up).
 */
export const NO_NEGATIVE_CONCORD: ReadonlySet<string> = new Set(['de', 'gsw']);

/** The clause's slots as they were before `negativePolarity` swapped them. */
export interface PositiveSlots {
  subject: ResolvedNounElement;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

interface Slot {
  el: ResolvedNounElement | undefined;
  positive?: ResolvedNounElement;
  revert?: () => void;
}

/**
 * A negated clause in a language without negative concord keeps only its **first** negative word:
 * every indefinite pronoun `negativePolarity` swapped after it goes back to its positive form, and
 * the clause's own "nicht" has already given way to that first word. "First" is the German order of
 * the middle field: the subject (the patient under the passive, then its agent), a negative adverb
 * (*nie*), the bare-dative recipient that leads the object (see `splitDative`), the object, and the
 * other complements in their render order. A `no` noun the plan names ("kein Hund") counts as a
 * negative word and is never changed — it is the plan's own determiner.
 *
 * Every other language is returned unchanged: Romance and Japanese concord say each negative word,
 * and English says *any-* after the one "not".
 */
export function singleNegativeWord(resolved: ResolvedPhrase, positive: PositiveSlots, language: string, passive: boolean): ResolvedPhrase {
  if (!NO_NEGATIVE_CONCORD.has(language)) return resolved;
  const out: ResolvedPhrase = { ...resolved, ...(resolved.complements ? { complements: { ...resolved.complements } } : {}) };
  const slots: Slot[] = passive
    ? [
        { el: out.subject, positive: positive.directObject, revert: () => { out.subject = positive.directObject!; } },
        { el: out.agent, positive: positive.subject, revert: () => { out.agent = positive.subject; } },
      ]
    : [{ el: out.subject }];
  const modifier = out.verbPhrase?.modifier;
  if (modifier?.forms['polarity'] === 'negative') slots.push({ el: undefined, positive: undefined });
  const complementSlot = (type: ComplementType): Slot | undefined => {
    const c = out.complements?.[type];
    const before = positive.complements?.[type];
    if (!c || !before) return undefined;
    return { el: c.phrase, positive: before.phrase, revert: () => { out.complements![type] = { ...c, phrase: before.phrase }; } };
  };
  const verb = out.verbPhrase?.verb.forms ?? {};
  const terminus = out.complements?.terminus;
  const dativeAhead = !!terminus && (recipientForms(terminus)['animate'] === '1' || verb['terminus_dative'] === '1');
  if (dativeAhead) slots.push(complementSlot('terminus')!);
  if (!passive) slots.push({ el: out.directObject, positive: positive.directObject, revert: () => { out.directObject = positive.directObject; } });
  for (const type of COMPLEMENT_RENDER_ORDER) {
    if (type === 'terminus' && dativeAhead) continue;
    const slot = complementSlot(type);
    if (slot) slots.push(slot);
  }
  let spent = false;
  for (const slot of slots) {
    // The negative adverb is a slot with no element: a negative word that cannot be reverted.
    const negativeWord = slot.el ? isNegative(slot.el) : !slot.revert;
    if (spent && slot.el && slot.positive && slot.el !== slot.positive) slot.revert?.();
    else if (negativeWord) spent = true;
  }
  return out;
}

/** Whether the element is a negative word: a swapped pronoun or a `no` noun. */
function isNegative(el: ResolvedNounElement): boolean {
  return el.agreement['definiteness'] === 'no' || el.conjuncts.some((np) => np.head.forms['definiteness'] === 'no');
}

/** The forms that decide whether a recipient is a bare dative, as `splitDative` reads them. */
function recipientForms(terminus: ResolvedComplement): Record<string, string> {
  const np = firstConjunct(terminus.phrase);
  return tonicPronoun(np) !== undefined ? tonicHeadForms(np) : np.head.forms;
}
