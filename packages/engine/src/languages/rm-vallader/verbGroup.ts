import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { AUX_TENSE, AVAIR, AVAIR_VL, ESSER, ESSER_VL, PROGRESSIVE_FRAME, PROSPECTIVE_FRAME, GNIR_VL } from './vallader.consts.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { agreeParticiple } from './agreeParticiple.js';
import { finiteCell, hasOwnCell } from './finiteCell.js';

/**
 * A verb group split where the negation and the clitics need it: the **finite** word, which *nu* and
 * a reflexive clitic precede ("nu **ha** mangià"), and the non-finite rest after it. `perfect` marks the
 * compound tense, whose auxiliary a reflexive clitic climbs to ("el s'es fermà", see `withReflexive`).
 */
export interface VerbGroup { finite: string; rest: string[]; perfect?: boolean }

type AuxTable = typeof ESSER_VL;

/** An auxiliary's finite cell: its mood's where the clause has one, else its tense's (`past` = imperfect). */
function auxCell(table: AuxTable, pn: string, tense: Tense, mood: Mood | undefined): string {
  if (mood === 'conditional' || mood === 'subjunctive') return table.conditional[pn]!;
  if (mood === 'presentSubjunctive') return table.subjunctive[pn]!;
  return table[AUX_TENSE[tense]][pn]!;
}

/**
 * The future's frame (P04 D7, E13, the style sheet): *gnir* conjugated for the person, then *a* — *ad*
 * before a vowel — and the infinitive group: "vegn a mangiar", "vain ad esser", "vain ad avair mangià".
 */
function future(pn: string, infinitiveGroup: string[], mood: Mood | undefined): VerbGroup {
  const [first = '', ...more] = infinitiveGroup;
  return { finite: auxCell(GNIR_VL, pn, 'present', mood), rest: [adBeforeVowel('a', first), first, ...more] };
}

/**
 * The compound tense's auxiliary and participle (P04 D5, E12): *esser* for a verb whose lexeme says
 * `aux: 'be'`, its participle agreeing with the subject ("la giatta es ida", "ils giats sun its"), and
 * *avair* for every other, whose participle never agrees ("ella ha mangià").
 */
function perfect(verbForms: Record<string, string>, agree: Record<string, string>, pn: string, tense: Tense, mood: Mood | undefined): VerbGroup {
  const esser = verbForms['aux'] === 'be';
  const participle = esser
    ? agreeParticiple(verbForms, agree['gender'] ?? 'masc', agree['number'] === 'plural')
    : verbForms['participle'] ?? verbForms['base'] ?? '';
  return { finite: auxCell(esser ? ESSER_VL : AVAIR_VL, pn, tense, mood), rest: [participle], perfect: true };
}

/**
 * The verb group of a plain (non-reflexive) verb in any tense, aspect and mood (P04-E10 … E16):
 *
 * | | present | past | future |
 * |---|---|---|---|
 * | neutral | *mangia* | *ha mangià* (a state verb: *vulaiva*) | *vain a mangiar* |
 * | resultative | *ha mangià* | *vaiva mangià* | *vain ad avair mangià* |
 * | progressive | *es landervia da mangiar* | *d'eira landervia da mangiar* | *vain ad esser landervia da mangiar* |
 * | prospective | *es sül punct da mangiar* | *d'eira sül punct da mangiar* | *vain ad esser sül punct da mangiar* |
 *
 * The neutral past **is** the present resultative (P04 D6, pinned as an equality in the suite). A
 * hypothetical mood reads its own cell of the finite word (`finiteCell`, `auxCell`) and keeps the rest:
 * "mangiess", "vess mangià", "füss landervia da mangiar".
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
  return { finite: auxCell(ESSER_VL, pn, moodCell ? 'present' : tense, mood), rest: [frame, verbForms['base'] ?? ''] };
}

/**
 * The same group as an infinitive — what a modal or the future governs, and a citation: "mangiar",
 * "avair mangià", "esser ida", "esser landervia da mangiar", "esser sül punct da mangiar" (inner
 * modals and the future take the bare infinitive; the column stores no -ing form at all).
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
