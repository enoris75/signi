import { BEDE } from './pl.consts.js';
import { lParticiple } from './lParticiple.js';
import { pnOf } from './pnOf.js';
import { presentFinite } from './presentFinite.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The future (P05 §0.3): a perfective's simple future (`pf_{p}_future`: *zje*); an imperfective's is
 * *być*'s future and the agreeing *l*-participle (*będzie jadł, będą jadły*, never stored) — except
 * BE's own, which it stores (*będę*). SHOULD has no future and keeps its present (verify).
 */
export function futureFinite(forms: Record<string, string>, perfective: boolean, agr: VerbAgr): string {
  const pn = pnOf(agr);
  if (perfective && forms['pf_base'] !== undefined) return forms[`pf_${pn}_future`] ?? forms['pf_base'];
  if (forms[`${pn}_future`]) return forms[`${pn}_future`]!;
  if (forms['defective_agreeing'] === '1') return presentFinite(forms, agr);
  return `${BEDE[pn]} ${lParticiple(forms, false, agr)}`;
}
