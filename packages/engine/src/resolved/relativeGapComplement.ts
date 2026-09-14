import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';

/** The head forms a relativizer stand-in keeps: agreement, and what picks a complement's preposition. */
const RELATIVIZER_KEPT_FORMS = ['gender', 'number', 'count', 'animate', 'human', 'mannerRelation', 'temporal'] as const;

/**
 * The gap complement of a relative clause whose head fills a complement slot — "the house the cat
 * eats IN" relativises on `locative` — as a one-complement map for the engine's own
 * `complementsPhrase`, or `undefined` for any other gap. A predicative gap ("the legend the cat
 * becomes") takes no preposition and renders like a direct object, so it is not one.
 *
 * The complement's noun phrase is a stand-in for the head: the relativizer word the engine passes
 * in `forms` (English "which", Italian "quale", Spanish "que"…) on the head's agreement and animacy,
 * with nothing else of the head — no adjectives, no concept id (so no idiom), no proper-name
 * article. Rendering it through the complement path gives the relativizer the preposition, case
 * and contraction the head would take there: "in which", "in dem", "nella quale", "al que".
 */
export function relativeGapComplement(
  np: ResolvedNounPhrase,
  forms: Record<string, string>,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  const rel = np.relative;
  if (!rel || rel.headRole === 'subject' || rel.headRole === 'directObject' || rel.headRole === 'predicative') return undefined;
  const kept = Object.fromEntries(
    RELATIVIZER_KEPT_FORMS.filter((k) => np.head.forms[k] !== undefined).map((k) => [k, np.head.forms[k]]),
  );
  const head: ResolvedNounPhrase = { head: { conceptId: '', forms: { ...kept, ...forms } }, adjectives: [], nounModifiers: [] };
  const complement: ResolvedComplement = {
    phrase: { conjuncts: [head], agreement: head.head.forms },
    ...(rel.headSpecifiers ? { specifiers: rel.headSpecifiers } : {}),
  };
  return { [rel.headRole]: complement };
}
