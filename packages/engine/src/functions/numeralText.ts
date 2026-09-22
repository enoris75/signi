import { numeralWord, type CardinalTable } from './numeralWord.js';

/**
 * The cardinal a phrase's forms carry, spelled in this language and agreed where the language agrees
 * it (see NounPhrase.numeral, C31) — or "" where the phrase counts nothing. The value rides on the
 * head's forms, as the determiner and the degree do, so every engine reads it off the record it is
 * already holding.
 */
export function numeralText(forms: Record<string, string>, table: CardinalTable): string {
  const value = forms['numeral'];
  if (value === undefined) return '';
  return numeralWord(table, Number(value), (forms['gender'] ?? 'masc') === 'fem');
}
