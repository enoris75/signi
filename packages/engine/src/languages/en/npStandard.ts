import type { ResolvedNounPhrase } from '../../types.js';
import { enAdj } from './enAdj.js';
import { enStandard } from './enStandard.js';
import { isPostposedEquative } from './isPostposedEquative.js';

/**
 * What a noun phrase says after its head noun for its one attributive standard (P09-E18), or '': the
 * comparative's standard, the adjective staying before the noun — "a bigger cat **than the dog**" —
 * or the equative adjective itself with its standard — "a cat **as big as the dog**". It stands
 * before an of-possessor and a relative clause: "a bigger cat than the dog that sleeps".
 */
export function npStandard(np: ResolvedNounPhrase): string {
  const own = np.adjectiveStandard;
  const a = own ? np.adjectives[own.index] : undefined;
  if (!own || !a) return '';
  const standard = enStandard(a, own.standard);
  return isPostposedEquative(np, a) ? [enAdj(a), standard].filter(Boolean).join(' ') : standard;
}
