import { PAST_ENDINGS } from './pl.consts.js';
import { aspectForm } from './aspectForm.js';
import { lParticiple } from './lParticiple.js';
import { pnOf } from './pnOf.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The past: the *l*-participle and the person ending (P05 §1: never stored). The 1st and 2nd singular
 * masculine take *-em, -eś* on the stem, which is `past_stem_masc` where it differs from the
 * participle (*mógł → mogłem*); the feminine and neuter take *-m, -ś* (*zjadłam*), the plurals *-śmy,
 * -ście* (*zjedliśmy, zjadłyście*). A participle written as two words (SHOULD's *powinien był*) takes
 * the ending on its last word (verify: *powinienem był* is also written).
 */
export function pastFinite(forms: Record<string, string>, perfective: boolean, agr: VerbAgr): string {
  const participle = lParticiple(forms, perfective, agr);
  const ending = PAST_ENDINGS[pnOf(agr)] ?? '';
  if (!ending) return participle;
  if (!agr.plural && agr.gender === 'masc') {
    const stem = aspectForm(forms, perfective, 'past_stem_masc') ?? participle;
    return `${stem}e${ending}`;
  }
  return `${participle}${ending}`;
}
