import type { ResolvedPhrase } from '../types.js';

/**
 * The word an object clause opens with (P09-E4, P09-E17): the language's `that` under a statement, its
 * `whether` under an indirect yes/no question, and nothing under an indirect wh-question, which opens
 * on its own question word — "says **that** the cat runs", "asks **whether** the cat runs", "asks
 * what the cat eats". Which force the clause has the translator decided (see ResolvedPhrase.embedded).
 */
export function objectComplementizer(clause: ResolvedPhrase, that: string, whether: string): string {
  if (!clause.embedded) return that;
  return clause.question ? '' : whether;
}
