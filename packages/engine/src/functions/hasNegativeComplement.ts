import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';
import { mannerRelation } from './mannerRelation.js';

/**
 * Whether one complement conjunct is a **comparison** — a `manner` phrase whose head takes the
 * `similative` relation, the one a manner noun declaring none falls back to. "Like the dog" compares
 * the act to how a dog does it, so "like no dog" says it is done as no dog does it and asserts
 * nothing negative about the clause: the negative word belongs inside the comparison, where Romance
 * licenses it without touching the verb ("canta come nessuno", "chante comme personne"). The
 * measure, means and mode relations are not comparisons — "at no speed" does negate (A181).
 */
function isComparison(type: ComplementType, np: ResolvedNounPhrase): boolean {
  return type === 'manner' && mannerRelation(np.head.forms) === 'similative';
}

/**
 * Whether any complement carries a `no`-determined phrase that negates the **clause** — a postverbal
 * negative word. In the Romance languages this obliges the preverbal negator (non / ne / no / não),
 * exactly as a negative direct object does; English and German need no concord, and read it as one of
 * the clause's `negationSources`. Checks every complement's noun phrase, skipping the comparisons
 * above.
 *
 * `countComparisons` puts the comparisons back in, for Japanese: a similative `no` renders with the
 * どの…も circumfix (どの犬のようにも), which needs the clause-final ない to close, and Japanese has no
 * phrasing for "like no X" over a positive verb — so its predicate keeps counting one (A181).
 */
export function hasNegativeComplement(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  { countComparisons = false }: { countComparisons?: boolean } = {},
): boolean {
  if (!complements) return false;
  return Object.entries(complements).some(([type, c]) => c?.phrase.conjuncts.some((np) =>
    np.head.forms['definiteness'] === 'no'
    && (countComparisons || !isComparison(type as ComplementType, np))));
}
