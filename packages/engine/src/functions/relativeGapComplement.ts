import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';
import { opponentLink } from './opponentLink.js';
import { relativizerStandIn } from './relativizerStandIn.js';

/**
 * The gap complement of a relative clause whose head fills a complement slot — "the house the cat
 * eats IN" relativises on `locative` — as a one-complement map for the engine's own
 * `complementsPhrase`, or `undefined` for any other gap. A predicative gap ("the legend the cat
 * becomes") takes no preposition and renders like a direct object, so it is not one; nor is the
 * object predicative it mirrors, nor a `'possessor'` gap, whose relativizer is the possessive one
 * each engine writes on the clause's own subject ("a period whose noun is a word"), nor a passive's
 * `'agent'` gap, which takes the by-phrase's adposition (see `relativeAgentGap`).
 *
 * The complement's noun phrase is a stand-in for the head (see `relativizerStandIn`). Rendering it
 * through the complement path gives the relativizer the preposition, case and contraction the head
 * would take there: "in which", "in dem", "nella quale", "al que". An opponent gap takes the word the
 * relative's verb names for its opponent, as the statement does (`opponentLink`): "with which", "mit
 * dem", "con il quale" (A350).
 */
export function relativeGapComplement(
  np: ResolvedNounPhrase,
  forms: Record<string, string>,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  const rel = np.relative;
  if (!rel || rel.headRole === 'subject' || rel.headRole === 'directObject' || rel.headRole === 'possessor'
    || rel.headRole === 'agent' || rel.headRole === 'predicative' || rel.headRole === 'objectPredicative') return undefined;
  const complement: ResolvedComplement = {
    phrase: relativizerStandIn(np, forms),
    ...(rel.headSpecifiers ? { specifiers: rel.headSpecifiers } : {}),
    ...(rel.headRole === 'opponent' && opponentLink(rel.verbPhrase.verb.forms) ? { link: opponentLink(rel.verbPhrase.verb.forms) } : {}),
  };
  return { [rel.headRole]: complement };
}
