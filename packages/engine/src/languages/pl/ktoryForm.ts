import { CO, KTO } from './pl.consts.js';
import { declineAdj } from './declineAdj.js';
import type { Agr, Case } from './pl.types.js';

/**
 * The relative pronoun (P05 §0.6): *który*, agreeing with its head in gender and number and taking
 * its case from its role in the clause (*kot, który je*; *mysz, którą kot je*; *chłopcy, których kot
 * widzi*) — declined as the adjective it is, virile *którzy*. An indefinite pronoun head takes *kto* /
 * *co* instead (*ktoś, kto biegnie*; *coś, czego kot nie je*).
 */
export function ktoryForm(kase: Case, agr: Agr, pronoun?: 'kto' | 'co'): string {
  const c = kase === 'voc' ? 'nom' : kase;
  if (pronoun) return (pronoun === 'kto' ? KTO : CO)[c];
  return declineAdj('który', 'którzy', c, agr);
}
