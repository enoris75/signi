import type { ConceptForms } from '../../types.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { LT_DEGREE, LT_STANDARD_DEGREE } from './lt.consts.js';
import { declineAdj } from './declineAdj.js';
import { isTableAdj, tableAdj } from './tableAdj.js';
import type { Agr, Case } from './lt.types.js';

/**
 * An adjective agreeing in case, gender and number, in its degree (P18 §2.1): the synthetic
 * comparative and superlative the lexeme stores (*didesnis, didžiausias*; *geresnis, geriausias*),
 * declined by their own class (*-is*, *-ias*), and *labiau / labiausiai / mažiau / mažiausiai / taip
 * pat* before the positive where it stores none (an empty `comparative`: *labiau semantinis*). An
 * intensifier leads (*labai didelis*); one with an equative of its own replaces *taip pat*. A stored
 * table (`tableAdj`) is read cell by cell.
 */
export function adjForm(adjective: ConceptForms, kase: Case, agr: Agr): string {
  const f = adjective.forms;
  const positive = (): string => isTableAdj(f) ? tableAdj(f, kase, agr) : declineAdj(f['base'] ?? '', kase, agr, f['neuter']);
  const comparative = f['comparative'];
  const superlative = f['superlative'];
  const degree = f['degree'];
  const surface =
    degree === 'more' && comparative ? declineAdj(comparative, kase, agr)
    : degree === 'most' && superlative ? declineAdj(superlative, kase, agr)
    : degree === 'equally' && f['intensifier_equative'] === '1' ? positive()
    : degree === 'equally' && f['standard'] === '1' ? `${LT_STANDARD_DEGREE.equally} ${positive()}`
    : degree && degree !== 'positive' ? `${LT_DEGREE[degree as keyof typeof LT_DEGREE] ?? ''} ${positive()}`.trim()
    : positive();
  return withIntensifier(adjective, surface);
}
