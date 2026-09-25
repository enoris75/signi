import type { Case } from './gsw.types.js';

/**
 * German's dative plural *-n* (*den Hunden*). Swiss German has none — *de Hünd*, *mit de Chatze* — so
 * the noun is left as it is; the function is kept so the noun-phrase code reads as its German parent.
 */
export function datPluralN(word: string, _case: Case, plural: boolean): string {
  void _case; void plural;
  return word;
}
