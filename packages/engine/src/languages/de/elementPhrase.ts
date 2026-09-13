import { firstConjunct, isPronounElement, objectPronounForm, type ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { nounPhrase } from './nounPhrase.js';

/**
 * A whole noun slot in one case. Every conjunct declines for that case *individually* — German
 * marks case on the article, so it repeats across the coordination ("mit dem Messer und dem
 * Stock"), it cannot be factored out in front of the group.
 */
export function elementPhrase(el: ResolvedNounElement, _case: 'nom' | 'acc' | 'dat'): string {
  // A pronoun direct object takes its accusative form with no article ("sieht ihn"), not the noun
  // path that would give "den ich". elementPhrase is only ever called for the accusative object.
  if (_case === 'acc' && isPronounElement(el)) return objectPronounForm(firstConjunct(el).head.forms);
  return coordinate(el, (np) => nounPhrase(np, _case));
}
