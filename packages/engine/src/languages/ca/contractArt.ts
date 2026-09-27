import { artFor } from './artFor.js';
import { defArticle } from './defArticle.js';

/**
 * The definite article a preposition leads, gated as `artFor` gates a proper noun: a common noun
 * always takes it ("del gat" once contracted), a proper noun only when its lexeme says `takes_article`
 * ("de l'Àfrica"), and otherwise goes bare ("d'Europa").
 */
export function contractArt(forms: Record<string, string>, plural: boolean): string {
  return forms['proper'] === '1' ? artFor(forms, plural) : defArticle(forms, plural);
}
