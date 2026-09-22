import type { ResolvedNounPhrase } from '../../types.js';
import { withRelative } from './withRelative.js';

/**
 * A headless relative-clause gloss (see NounPhrase.relativeGloss): the phrase's relative clause
 * alone, "que se salvou", "que não é sólida". `withRelative` appends to a head's surface what
 * follows it — its attributive nouns, its possessor, its relative — so, handed no surface and none
 * of what belongs to the head, it leaves the relative. The head's forms stay, because the clause
 * still agrees with them: it is the antecedent ("que não é sólida" of a feminine one).
 */
export function relativeGloss(np: ResolvedNounPhrase): string {
  return withRelative('', { ...np, nounModifiers: [], possessor: undefined }).trim();
}
