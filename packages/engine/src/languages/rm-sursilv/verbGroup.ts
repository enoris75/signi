import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AUX_TENSE, HAVER, HAVER_SURSILV, ESSER, ESSER_SURSILV, PROGRESSIVE_FRAME, PROSPECTIVE_FRAME, VEGNIR_SURSILV } from './sursilv.consts.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { agreeParticiple } from './agreeParticiple.js';
import { finiteCell, hasOwnCell } from './finiteCell.js';

/**
 * A verb group split where the negation needs it: the **finite** word, which *buca* follows ("el
 * **ha** buca magliau"), and the non-finite
 * rest after it.
 */
export interface VerbGroup { finite: string; rest: string[] }

type AuxTable = typeof ESSER_SURSILV;

/** An auxiliary's finite cell: its mood's where the clause has one, else its tense's (`past` = imperfect). */
function auxCell(table: AuxTable, pn: string, tense: Tense, mood: Mood | undefined): string {
  if (mood === 'conditional' || mood === 'subjunctive') return table.conditional[pn]!;
  if (mood === 'presentSubjunctive') return table.subjunctive[pn]!;
  return table[AUX_TENSE[tense]][pn]!;
}

/**
 * The future's frame (P04 D7, E13): *vegnir* conjugated for the person, then *a* — *ad* before a
 * vowel — and the infinitive group: "vegn a magliar", "vegn ad esser", "vegn ad haver magliau".
 */
function future(pn: string, infinitiveGroup: string[], mood: Mood | undefined): VerbGroup {
  const [first = '', ...more] = infinitiveGroup;
  return { finite: auxCell(VEGNIR_SURSILV, pn, 'present', mood), rest: [adBeforeVowel('a', first), first, ...more] };
}

/**
 * The compound tense's auxiliary and participle (P04 D5, E12): *esser* for a verb whose lexeme says
 * `aux: 'be'`, its participle agreeing with the subject ("la gatta ei ida", "ils gats ein ids"), and
 * *haver* for every other, whose participle never agrees ("ella ha magliau").
 */
function perfect(verbForms: Record<string, string>, agree: Record<string, string>, pn: string, tense: Tense, mood: Mood | undefined): VerbGroup {
  const esser = verbForms['aux'] === 'be';
  const participle = esser
    ? agreeParticiple(verbForms, agree['gender'] ?? 'masc', agree['number'] === 'plural')
    : verbForms['participle'] ?? verbForms['base'] ?? '';
  return { finite: auxCell(esser ? ESSER_SURSILV : HAVER_SURSILV, pn, tense, mood), rest: [participle] };
}

/**
 * The verb group of a verb in any tense, aspect and mood (P04-E10 … E16):
 *
 * | | present | past | future |
 * |---|---|---|---|
 * | neutral | *maglia* | *ha magliau* (a state verb: *vuleva*) | *vegn a magliar* |
 * | resultative | *ha magliau* | *haveva magliau* | *vegn ad haver magliau* |
 * | progressive | *ei vid magliar* | *fuva vid magliar* | *vegn ad esser vid magliar* |
 * | prospective | *ei sin il punct da magliar* | *fuva sin il punct da magliar* | *vegn ad esser sin il punct da magliar* |
 *
 * The neutral past **is** the present resultative (P04 D6, pinned as an equality in the suite). A
 * hypothetical mood reads its own cell of the finite word (`finiteCell`, `auxCell`) and keeps the rest:
 * "magliass", "havess magliau", "fuss vid magliar".
 */
export function verbGroup(
  verbForms: Record<string, string>,
  agree: Record<string, string>,
  pn: string,
  tense: Tense,
  aspect: Aspect,
  mood: Mood | undefined,
): VerbGroup {
  const moodCell = hasOwnCell(mood);
  if (aspect === 'neutral') {
    const cell = finiteCell(verbForms, pn, moodCell ? 'present' : tense, mood);
    if (cell !== undefined) return { finite: cell, rest: [] };
    if (tense === 'future') return future(pn, [verbForms['base'] ?? ''], mood);
    return perfect(verbForms, agree, pn, 'present', mood);
  }
  if (aspect === 'resultative') {
    if (tense === 'future' && !moodCell) return future(pn, infinitiveGroup(verbForms, agree, 'resultative'), mood);
    return perfect(verbForms, agree, pn, moodCell ? 'present' : tense, mood);
  }
  if (tense === 'future' && !moodCell) return future(pn, infinitiveGroup(verbForms, agree, aspect), mood);
  const frame = aspect === 'progressive' ? PROGRESSIVE_FRAME : PROSPECTIVE_FRAME;
  return { finite: auxCell(ESSER_SURSILV, pn, moodCell ? 'present' : tense, mood), rest: [frame, verbForms['base'] ?? ''] };
}

/**
 * The same group as an infinitive — what a modal or the future governs, and a citation: "magliar",
 * "haver magliau", "esser ida", "esser vid magliar", "esser sin il punct da magliar" (P04
 * §2.2: inner modals and the future take the bare infinitive; Sursilvan stores no -ing form at all).
 */
export function infinitiveGroup(verbForms: Record<string, string>, agree: Record<string, string>, aspect: Aspect): string[] {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return [ESSER, PROGRESSIVE_FRAME, inf];
  if (aspect === 'prospective') return [ESSER, PROSPECTIVE_FRAME, inf];
  if (aspect === 'resultative') {
    const esser = verbForms['aux'] === 'be';
    const participle = esser
      ? agreeParticiple(verbForms, agree['gender'] ?? 'masc', agree['number'] === 'plural')
      : verbForms['participle'] ?? inf;
    return [esser ? ESSER : HAVER, participle];
  }
  return [inf];
}
