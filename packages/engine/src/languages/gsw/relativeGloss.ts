import type { ResolvedNounPhrase } from '../../types.js';
import { subordinateClause } from './subordinateClause.js';

/**
 * A headless relative-clause gloss (see NounPhrase.relativeGloss): the phrase's relative clause
 * alone, "den man gespeichert hat", "das nicht fest ist". The relative pronoun still takes the
 * head's gender and number — the head is unsaid, but it is the antecedent — and the gap's case.
 * `subordinateClause` brackets the clause in the commas that set it off from a head and from the
 * rest of the sentence; with neither there, it has none. A comma inside the clause, around a
 * relative nested in it, stays.
 */
export function relativeGloss(np: ResolvedNounPhrase): string {
  return subordinateClause(np).replace(/^, /, '').replace(/,$/, '');
}
