import type { Case } from './de.types.js';

/**
 * A weak masculine (n-declension) noun takes -(e)n in every case but the nominative singular
 * ("der Junge" but "den/dem/des Jungen"). Weakness is a lexical property of the noun (forms.weak),
 * so it fires wherever the singular surfaces in an oblique case, and it also supplies the genitive
 * (a weak noun takes no -(e)s). The ending is -n after a final -e (Junge → Jungen), -en otherwise
 * (Mensch → Menschen). The plural already carries its own -n, so it is left alone.
 */
export function weakN(word: string, _case: Case, plural: boolean): string {
  if (plural || _case === 'nom' || !word) return word;
  return word.endsWith('e') ? `${word}n` : `${word}en`;
}
