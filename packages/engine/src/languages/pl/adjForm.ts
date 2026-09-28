import type { ConceptForms } from '../../types.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { PL_DEGREE, PL_STANDARD_DEGREE } from './pl.consts.js';
import { declineAdj } from './declineAdj.js';
import { isTableAdj, tableAdj } from './tableAdj.js';
import type { Agr, Case } from './pl.types.js';

/**
 * An adjective agreeing in case, gender and number, in its degree (P05 §2.1): the synthetic
 * comparative the lexeme stores (*większy*), the superlative *naj-* + comparative (*największy*),
 * both declined as any *-y* adjective (virile *więksi*), and *bardziej / najbardziej / mniej /
 * najmniej / równie* before the positive where it stores none. The equative before a standard is *tak*
 * (*tak duży jak pies*). An intensifier leads (*bardzo duży*, *o wiele większy*); one with an equative
 * of its own (*tak samo duży*) replaces *równie*.
 */
export function adjForm(adjective: ConceptForms, kase: Case, agr: Agr): string {
  const f = adjective.forms;
  const positive = (): string => isTableAdj(f) ? tableAdj(f, kase, agr) : declineAdj(f['base'] ?? '', f['virile'], kase, agr);
  const comparative = f['comparative'];
  const degree = f['degree'];
  const synthetic = (word: string) => declineAdj(word, word.replace(/szy$/, 'si'), kase, agr);
  const surface =
    degree === 'more' && comparative ? synthetic(comparative)
    : degree === 'most' && comparative ? synthetic(`naj${comparative}`)
    : degree === 'equally' && f['intensifier_equative'] === '1' ? positive()
    : degree === 'equally' && f['standard'] === '1' ? `${PL_STANDARD_DEGREE.equally} ${positive()}`
    : degree && degree !== 'positive' ? `${PL_DEGREE[degree as keyof typeof PL_DEGREE] ?? ''} ${positive()}`.trim()
    : positive();
  return withIntensifier(adjective, surface);
}
