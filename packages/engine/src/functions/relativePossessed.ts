import type { ResolvedNounElement, ResolvedRelativeClause } from '../types.js';
import { withDefiniteness } from './withDefiniteness.js';

/**
 * The possessed subject of a **genitive relative clause** ("a period whose **noun** is a word") —
 * the clause's own subject, which the head owns rather than fills. `undefined` for any other gap,
 * and for a `'possessor'` gap with no subject to possess, so an engine's branch doubles as the
 * test that it has one.
 *
 * The possessive relativizer stands where the phrase's determiner would (en "whose noun", it "il
 * cui nome", de "dessen Nomen"), so the phrase comes back article-less; French, which keeps the
 * article after "dont", asks for `'definite'` instead.
 */
export function relativePossessed(
  rel: ResolvedRelativeClause | undefined,
  definiteness = 'bare',
): ResolvedNounElement | undefined {
  if (rel?.headRole !== 'possessor' || !rel.subject) return undefined;
  return { ...rel.subject, conjuncts: rel.subject.conjuncts.map((np) => withDefiniteness(np, definiteness)) };
}
