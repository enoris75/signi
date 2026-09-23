import type { PhrasePlan } from '@signi/shared';
import { nounConjuncts } from '@signi/shared';
import type { LexiconLookup } from '../translator.types.js';

/**
 * The lexeme forms of `plan`'s **predicate adjective** — what governs a clausal subject ("it is
 * **right** that one acts"), and so what names the mood that clause stands in (`content_clause_mood`,
 * P09-E4). A coordinated predicate is governed by its first conjunct, the one nearest the clause.
 * Undefined where the clause has no predicative complement.
 */
export function predicativeGovernor(
  plan: PhrasePlan,
  language: string,
  lookup: LexiconLookup,
): Record<string, string> | undefined {
  const predicative = plan.complements?.['predicative'];
  if (!predicative) return undefined;
  const [first] = nounConjuncts(predicative.phrase);
  return first ? lookup(first.concept, language)?.forms : undefined;
}
