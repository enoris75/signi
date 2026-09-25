import type { Case } from './gsw.types.js';
import { determiner } from './determiner.js';

/**
 * The Swiss German contractions of a preposition with the definite article (the Dieth style sheet):
 * the dative *em* fuses after i, a, zu, vo and bi (*im, am, zum, vom, bim*), the neuter *s* after i, a
 * and uf (*is, as, ufs*). The feminine dative *de* stays apart (*zu de Frau*), as does *mit em*.
 */
const CONTRACTIONS: Record<string, string> = {
  'i em': 'im', 'a em': 'am', 'zu em': 'zum', 'vo em': 'vom', 'bi em': 'bim',
  'i s': 'is', 'a s': 'as', 'uf s': 'ufs',
};

/**
 * A complement's preposition + case-declined determiner, honoring `definiteness`. Only a
 * *definite* article fuses with the preposition (see `CONTRACTIONS`); any other determiner (emene,
 * keim, vill, bare) rides after the plain preposition. An empty `prep` is the bare-dative terminus —
 * the determiner alone.
 */
export function prepDet(prep: string, forms: Record<string, string>, _case: Case, plural: boolean): string {
  const det = determiner(forms, _case, plural);
  // An inherently articled name surfaces the definite article whatever was picked (see
  // `determiner`), so it fuses like one.
  const articled = forms['proper'] === '1' && forms['takes_article'] === '1';
  if ((forms['definiteness'] ?? 'definite') === 'definite' || articled) {
    const fused = CONTRACTIONS[`${prep} ${det}`];
    if (fused) return fused;
  }
  if (!prep) return det;
  return det ? `${prep} ${det}` : prep;
}
