import type { ResolvedNounElement, ResolvedNounPhrase } from '../types.js';

/** The head forms a relativizer stand-in keeps: agreement, and what picks a complement's preposition. */
const RELATIVIZER_KEPT_FORMS = ['gender', 'number', 'count', 'animate', 'human', 'mannerRelation', 'temporal'] as const;

/**
 * A stand-in for the head of a relative clause whose gap takes an adposition: the relativizer word
 * the engine passes in `forms` (English "which", Italian "quale", Spanish "que"…) on the head's
 * agreement and animacy, with nothing else of the head — no adjectives, no concept id (so no idiom),
 * no proper-name article. An engine renders it wherever the head would stand in the clause, and it
 * comes out with that slot's preposition, case and contraction: "in which", "nella quale", "by whom".
 */
export function relativizerStandIn(np: ResolvedNounPhrase, forms: Record<string, string>): ResolvedNounElement {
  const kept = Object.fromEntries(
    RELATIVIZER_KEPT_FORMS.filter((k) => np.head.forms[k] !== undefined).map((k) => [k, np.head.forms[k]]),
  );
  const head: ResolvedNounPhrase = { head: { conceptId: '', forms: { ...kept, ...forms } }, adjectives: [], nounModifiers: [] };
  return { conjuncts: [head], agreement: head.head.forms };
}
