import type { ResolvedNounElement } from '../../types.js';
import { PL_DOMAIN, PL_STANDARD } from './pl.consts.js';
import { elementText } from './elementText.js';
import { withPreposition } from './withPreposition.js';

/**
 * The standard a degree compares with (P09-E5): *niż* + nominative after a comparative (*większy niż
 * pies*), *jak* after the equative (*tak duży jak pies*), each an abbreviated clause whose subject
 * stays nominative (verify: *od* + genitive, *większy od psa*, is as common). A superlative's set is
 * *z* + genitive (*największy z kotów*, P09-E19).
 */
export function standardText(adjective: Record<string, string>, standard: ResolvedNounElement): string {
  if (adjective['domain'] === '1') return withPreposition(PL_DOMAIN.prep, elementText(standard, PL_DOMAIN.case, { afterPrep: true }));
  const degree = adjective['degree'] as keyof typeof PL_STANDARD | undefined;
  const word = adjective['intensifier_equative'] === '1' ? 'jak' : (degree ? PL_STANDARD[degree] : undefined) ?? '';
  return [word, elementText(standard, 'nom')].filter(Boolean).join(' ');
}
