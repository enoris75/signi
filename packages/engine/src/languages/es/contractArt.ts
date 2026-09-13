import { artFor } from './artFor.js';
import { defArticle } from './defArticle.js';

/**
 * The definite article a "de"/"a" contraction should carry, gated the same way the locative's
 * `artFor` gates a proper noun: a common noun always articles ("del gato"), but a proper noun
 * articles only when lexically marked ("de la Antártida"), and otherwise goes bare ("de Europa",
 * not "de la Europa"). `artFor` returns '' for a proper noun without `takes_article`.
 */
export function contractArt(forms: Record<string, string>, plural: boolean): string {
  return forms['proper'] === '1' ? artFor(forms, plural) : defArticle(forms, plural);
}
