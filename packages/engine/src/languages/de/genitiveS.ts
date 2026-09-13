import type { Case } from './de.types.js';

/**
 * The genitive -(e)s a masculine/neuter *singular* noun carries ("des Wortes", "des Mädchens"):
 * the long -es after a sibilant, where a bare -s would be unpronounceable, and after a
 * monosyllable, where it is the standard form; the short -s otherwise. A feminine or a plural
 * takes no ending at all — there the article alone marks the case ("einer Katze", "der Wörter").
 */
export function genitiveS(word: string, _case: Case, forms: Record<string, string>, plural: boolean): string {
  if (_case !== 'gen' || plural || !word) return word;
  if ((forms['gender'] ?? 'neut') === 'fem') return word;
  if (/(?:s|ß|z|x|tsch)$/i.test(word)) return `${word}es`;
  const syllables = (word.match(/[aeiouäöüy]+/gi) ?? []).length;
  return syllables <= 1 ? `${word}es` : `${word}s`;
}
