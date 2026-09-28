import type { ResolvedNounElement } from '../../types.js';
import { LT_DOMAIN, LT_STANDARD } from './lt.consts.js';
import { elementText } from './elementText.js';
import { withPreposition } from './withPreposition.js';

/**
 * The standard a degree compares with (P09-E5): *nei* + nominative after a comparative (*didesnis nei
 * šuo*), *kaip* after the equative (*taip pat didelis kaip šuo*), each an abbreviated clause whose
 * subject stays nominative (verify: *už* + accusative, *didesnis už šunį*, is as common). A
 * superlative's set is *iš* + genitive (*didžiausias iš kačių*, P09-E19).
 */
export function standardText(adjective: Record<string, string>, standard: ResolvedNounElement): string {
  if (adjective['domain'] === '1') return withPreposition(LT_DOMAIN.prep, elementText(standard, LT_DOMAIN.case));
  const degree = adjective['degree'] as keyof typeof LT_STANDARD | undefined;
  const word = adjective['intensifier_equative'] === '1' ? 'kaip' : (degree ? LT_STANDARD[degree] : undefined) ?? '';
  return [word, elementText(standard, 'nom')].filter(Boolean).join(' ');
}
