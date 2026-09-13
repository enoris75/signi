import type { Case } from './de.types.js';
import { defArticle } from './defArticle.js';

/**
 * The German relative pronoun agreeing with a head of this gender and number, in a case. It is the
 * definite article except where it lengthens: the dative plural "denen" and the genitive "dessen" /
 * "deren" ("die Häuser, in denen …", "der Hund, durch dessen Schuld …").
 */
export function relativePronoun(forms: Record<string, string>, _case: Case, plural: boolean): string {
  if (_case === 'gen') return plural || forms['gender'] === 'fem' ? 'deren' : 'dessen';
  if (_case === 'dat' && plural) return 'denen';
  return defArticle(forms, _case, plural);
}
