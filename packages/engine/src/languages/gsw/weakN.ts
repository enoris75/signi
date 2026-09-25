import type { Case } from './gsw.types.js';

/**
 * German's weak masculine *-(e)n* outside the nominative (*den Menschen*). A Swiss German noun takes
 * no case ending at all (P10 D7): *de Mänsch*, *em Mänsch*. Kept as the identity so the noun-phrase
 * code reads as its German parent.
 */
export function weakN(word: string, _case: Case, plural: boolean): string {
  void _case; void plural;
  return word;
}
