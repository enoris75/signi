import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { PT_SUPPLETIVE } from './pt.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { ptDeg } from './ptDeg.js';

/**
 * An adjective's comparison surface, agreed with the noun. A suppletive raised degree replaces
 * the base outright and is itself agreed (maior → maiores); every other case is the periphrastic
 * degree adverb prefixed onto the agreed base ("mais grande", "menos bom").
 *
 * An intensifier goes where its own lexeme says: *muito* leads the finished surface, *demais*
 * follows it ("muito grande", "grande demais"; see `withIntensifier`, C33).
 */
export function ptComparison(a: ConceptForms, gender: string, plural: boolean): string {
  const degree = adjDegree(a);
  // Keyed by the Portuguese word, so every concept spelled grande / bom / pequeno / mau suppletises.
  const suppletive = PT_SUPPLETIVE[a.forms['base'] ?? ''];
  if (suppletive && (degree === 'more' || degree === 'most')) {
    return withIntensifier(a, agreeAdj(suppletive, gender, plural));
  }
  return withIntensifier(a, ptDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural)));
}
