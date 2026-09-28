import { PAST_ENDINGS } from './pl.consts.js';
import { pnOf } from './pnOf.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The present, from the stored imperfective cell (`{p}_present`). SHOULD's *powinien* is the one
 * agreeing defective (`defective_agreeing`): its stored persons are the masculine and virile ones
 * (*powinienem, powinniśmy*); the others are the gendered stem with the past's endings (*powinnam,
 * powinna, powinno, powinnyśmy, powinny*) (style-pl.md).
 */
export function presentFinite(forms: Record<string, string>, agr: VerbAgr): string {
  const pn = pnOf(agr);
  const stored = forms[`${pn}_present`];
  if (forms['defective_agreeing'] === '1' && !(agr.plural ? agr.virile : agr.gender === 'masc')) {
    const stem = forms[agr.plural ? 'present_nonvirile' : `present_${agr.gender}`];
    if (stem) return `${stem}${PAST_ENDINGS[pn] ?? ''}`;
  }
  return stored ?? forms['base'] ?? '';
}
