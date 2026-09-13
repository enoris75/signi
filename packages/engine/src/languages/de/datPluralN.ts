import type { Case } from './de.types.js';

/**
 * Dative plural nouns take an -n ("den/vielen Häusern"), unless the plural already ends in
 * -n or -s ("den Katzen", "den Autos"). Applied wherever a noun surfaces in the dative.
 */
export function datPluralN(word: string, _case: Case, plural: boolean): string {
  return _case === 'dat' && plural && word && !/[ns]$/.test(word) ? `${word}n` : word;
}
