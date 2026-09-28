import { PAST_ENDINGS } from './pl.consts.js';
import { lParticiple } from './lParticiple.js';
import { pnOf } from './pnOf.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The conditional (P05 §2.4): the *l*-participle, *by*, and the person ending — *zjadłbym, zjadłabyś,
 * zjadłby, zjedlibyśmy, zjadłybyście*. The masculine singular keeps its participle whole (*mógłbym*,
 * not the past's *mogłem* stem).
 */
export function conditionalFinite(forms: Record<string, string>, perfective: boolean, agr: VerbAgr): string {
  return `${lParticiple(forms, perfective, agr)}by${PAST_ENDINGS[pnOf(agr)] ?? ''}`;
}
