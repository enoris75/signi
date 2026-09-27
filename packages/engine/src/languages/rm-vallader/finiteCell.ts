import type { Tense } from '@signi/shared';
import type { Mood } from '../../types.js';

/**
 * The stored cell a finite verb is read from (P04-E6 stores present, imperfect, conditional and
 * present subjunctive for every verb; engine-local, P04-E16 D1 — nothing in the shared `mood.ts`):
 *
 * - `conditional` (the apodosis) and `subjunctive` (the protasis a hypothetical puts under *scha*, and
 *   the past subjunctive after *avant cha*) both read `*_conditional`: Vallader's imperfect subjunctive
 *   is taken to be the conditional's *-ess / -iss* series ("scha'l chan cuorress, il giat mangiess",
 *   P04 §2.4, verify);
 * - `presentSubjunctive` reads `*_subjunctive` (*conjunctiv*: "eu crai ch'el saja");
 * - an indicative past of a state verb reads `*_imperfect` ("el vulaiva", "el vaiva", P04-E12 D3);
 * - anything else reads the present.
 *
 * `undefined` where the cell the tense needs is periphrastic (the compound past and the future are
 * `verbGroup`'s), so the caller builds the group instead.
 */
export function finiteCell(forms: Record<string, string>, pn: string, tense: Tense, mood: Mood | undefined): string | undefined {
  if (mood === 'conditional' || mood === 'subjunctive') return forms[`${pn}_conditional`] ?? forms[`${pn}_present`];
  if (mood === 'presentSubjunctive') return forms[`${pn}_subjunctive`] ?? forms[`${pn}_present`];
  if (tense === 'past') return forms['stative'] === '1' ? forms[`${pn}_imperfect`] : undefined;
  if (tense === 'future') return undefined;
  return forms[`${pn}_present`] ?? forms['base'];
}

/** Whether `mood` is one that reads a cell of its own, whatever the tense. */
export function hasOwnCell(mood: Mood | undefined): boolean {
  return mood === 'conditional' || mood === 'subjunctive' || mood === 'presentSubjunctive';
}
