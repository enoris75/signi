import type { Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import type { AuxTable, PN } from './ca.consts.js';

/**
 * The stored cell a finite verb is read from (style-ca.md § Verbs: every finite cell is stored, so
 * nothing is derived; engine-local, as rm-rumgr's — nothing in the shared `mood.ts`):
 *
 * - `conditional` (the apodosis) reads `*_conditional` ("menjaria");
 * - `subjunctive` (the protasis under *si*, and a past subjunctive clause) reads `*_past_subjunctive`,
 *   the imperfect subjunctive ("si el gos corregués");
 * - `presentSubjunctive` reads `*_subjunctive` ("que mengi"); so does Portuguese's future subjunctive,
 *   which no Catalan clause is resolved in;
 * - the indicative past of a state verb (`stative`, A130) reads `*_imperfect` ("volia", "era"), and a
 *   lexeme that stores a past of its own (`*_past`) reads that;
 * - the future reads `*_future` ("menjarà"), the present `*_present`.
 *
 * `undefined` for the past of any other verb: the periphrastic *va menjar* (P03 D2) is `verbGroup`'s.
 */
export function finiteCell(forms: Record<string, string>, pn: PN, tense: Tense, mood: Mood | undefined): string | undefined {
  if (mood === 'conditional') return forms[`${pn}_conditional`] ?? forms[`${pn}_present`];
  if (mood === 'subjunctive') return forms[`${pn}_past_subjunctive`] ?? forms[`${pn}_present`];
  if (mood === 'presentSubjunctive' || mood === 'futureSubjunctive') return forms[`${pn}_subjunctive`] ?? forms[`${pn}_present`];
  if (tense === 'past') {
    if (forms[`${pn}_past`]) return forms[`${pn}_past`];
    return forms['stative'] === '1' ? forms[`${pn}_imperfect`] : undefined;
  }
  if (tense === 'future') return forms[`${pn}_future`] ?? forms[`${pn}_present`] ?? forms['base'];
  return forms[`${pn}_present`] ?? forms['base'];
}

/** Whether `mood` reads a cell of its own, whatever the tense. */
export function hasOwnCell(mood: Mood | undefined): boolean {
  return mood === 'conditional' || mood === 'subjunctive' || mood === 'presentSubjunctive' || mood === 'futureSubjunctive';
}

/**
 * An auxiliary's finite cell (`ESTAR`, `HAVER`): its mood's where the clause has one, else its tense's.
 * The past is the imperfect — "estava menjant", "havia menjat" — which is the aspectual past the
 * progressive and the pluperfect take (not *va estar*, *va haver*: see `verbGroup`).
 */
export function auxCell(table: AuxTable, pn: PN, tense: Tense, mood: Mood | undefined): string {
  if (mood === 'conditional') return table.conditional[pn];
  if (mood === 'subjunctive') return table.past_subjunctive[pn];
  if (mood === 'presentSubjunctive' || mood === 'futureSubjunctive') return table.subjunctive[pn];
  return table[tense === 'past' ? 'imperfect' : tense === 'future' ? 'future' : 'present'][pn];
}
