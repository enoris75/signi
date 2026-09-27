import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AUX_TENSE, AVAIR, AVAIR_RG, ESSER, ESSER_RG, PROGRESSIVE_FRAME, PROSPECTIVE_FRAME, VEGNIR_RG } from './rumgr.consts.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { agreeParticiple } from './agreeParticiple.js';
import { finiteCell, hasOwnCell } from './finiteCell.js';

/**
 * A verb group split where the negation and the clitics need it: the **finite** word, which *na*
 * and a reflexive clitic precede and *betg* follows ("na **ha** betg mangià"), and the non-finite
 * rest after it.
 */
export interface VerbGroup { finite: string; rest: string[] }

type AuxTable = typeof ESSER_RG;

/** An auxiliary's finite cell: its mood's where the clause has one, else its tense's (`past` = imperfect). */
function auxCell(table: AuxTable, pn: string, tense: Tense, mood: Mood | undefined): string {
  if (mood === 'conditional' || mood === 'subjunctive') return table.conditional[pn]!;
  if (mood === 'presentSubjunctive') return table.subjunctive[pn]!;
  return table[AUX_TENSE[tense]][pn]!;
}

/**
 * The future's frame (P04 D7, E13): *vegnir* conjugated for the person, then *a* — *ad* before a
 * vowel — and the infinitive group: "vegn a mangiar", "vegn ad esser", "vegn ad avair mangià".
 */
function future(pn: string, infinitiveGroup: string[], mood: Mood | undefined): VerbGroup {
  const [first = '', ...more] = infinitiveGroup;
  return { finite: auxCell(VEGNIR_RG, pn, 'present', mood), rest: [adBeforeVowel('a', first), first, ...more] };
}

/**
 * The compound tense's auxiliary and participle (P04 D5, E12): *esser* for a verb whose lexeme says
 * `aux: 'be'`, its participle agreeing with the subject ("la giatta è ida", "ils giats èn ids"), and
 * *avair* for every other, whose participle never agrees ("ella ha mangià").
 */
function perfect(verbForms: Record<string, string>, agree: Record<string, string>, pn: string, tense: Tense, mood: Mood | undefined): VerbGroup {
  const esser = verbForms['aux'] === 'be';
  const participle = esser
    ? agreeParticiple(verbForms, agree['gender'] ?? 'masc', agree['number'] === 'plural')
    : verbForms['participle'] ?? verbForms['base'] ?? '';
  return { finite: auxCell(esser ? ESSER_RG : AVAIR_RG, pn, tense, mood), rest: [participle] };
}

/**
 * The verb group of a plain (non-reflexive) verb in any tense, aspect and mood (P04-E10 … E16):
 *
 * | | present | past | future |
 * |---|---|---|---|
 * | neutral | *mangia* | *ha mangià* (a state verb: *vuleva*) | *vegn a mangiar* |
 * | resultative | *ha mangià* | *aveva mangià* | *vegn ad avair mangià* |
 * | progressive | *è vidlonder da mangiar* | *era vidlonder da mangiar* | *vegn ad esser vidlonder da mangiar* |
 * | prospective | *è sin il punct da mangiar* | *era sin il punct da mangiar* | *vegn ad esser sin il punct da mangiar* |
 *
 * The neutral past **is** the present resultative (P04 D6, pinned as an equality in the suite). A
 * hypothetical mood reads its own cell of the finite word (`finiteCell`, `auxCell`) and keeps the rest:
 * "mangiass", "avess mangià", "fiss vidlonder da mangiar".
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
  return { finite: auxCell(ESSER_RG, pn, moodCell ? 'present' : tense, mood), rest: [frame, verbForms['base'] ?? ''] };
}

/**
 * The same group as an infinitive — what a modal or the future governs, and a citation: "mangiar",
 * "avair mangià", "esser ida", "esser vidlonder da mangiar", "esser sin il punct da mangiar" (P04
 * §2.2: inner modals and the future take the bare infinitive; RG stores no -ing form at all).
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
    return [esser ? ESSER : AVAIR, participle];
  }
  return [inf];
}
