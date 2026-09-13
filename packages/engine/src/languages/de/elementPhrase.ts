import { objectPronounForm, type ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { nounPhrase } from './nounPhrase.js';

/**
 * A whole noun slot in one case. Every conjunct declines for that case *individually* — German
 * marks case on the article, so it repeats across the coordination ("mit dem Messer und dem
 * Stock"), it cannot be factored out in front of the group.
 */
export function elementPhrase(el: ResolvedNounElement, _case: 'nom' | 'acc' | 'dat'): string {
  // A pronoun direct object takes its accusative form with no article ("sieht ihn"), not the noun
  // path that would give "den ich". The choice is per conjunct, so a group mixes the two ("den Hund
  // und dich"). Only the accusative object reaches a pronoun here.
  return coordinate(el, (np) =>
    _case === 'acc' && np.head.forms['person'] ? objectPronounForm(np.head.forms) : nounPhrase(np, _case));
}
