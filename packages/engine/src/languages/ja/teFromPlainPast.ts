import type { RubySegment } from '../../types.js';

/** The て-form ending of a plain-past ending, or `undefined` where there is none to turn. */
function teEnding(s: string): string | undefined {
  // The plain negative ends in 〜なかった, whose て-form is 〜なくて (食べなかった → 食べなくて); the
  // copula's だった is で (学生だった → 学生で). Only the negative's なかった is read as such: a verb's
  // own かった (勝った, "won") is 〜った and turns like any other.
  if (s.endsWith('なかった')) return `${s.slice(0, -3)}くて`;
  if (s.endsWith('だった')) return `${s.slice(0, -3)}で`;
  if (s.endsWith('た')) return `${s.slice(0, -1)}て`;
  if (s.endsWith('だ')) return `${s.slice(0, -1)}で`;
  return undefined;
}

/**
 * A plain clause built on the plain past, turned to end on the **て-form** (P09-E27): the Japanese
 * *since* clause is 〜てから, 猫が食べてから, and the plain past is the form the te-form already derives
 * (`plainVerbSeg` turns て→た, で→だ; this turns them back). Only the last segment changes — the
 * predicate's, whose kana ending is what differs — in its written form and its reading alike. A clause
 * ending on anything else is returned as it is.
 */
export function teFromPlainPast(segs: RubySegment[]): RubySegment[] {
  const last = segs[segs.length - 1];
  const t = last && teEnding(last.t);
  if (!last || t === undefined) return segs;
  const r = last.r === undefined ? undefined : teEnding(last.r);
  return [...segs.slice(0, -1), r === undefined ? { t } : { t, r }];
}
