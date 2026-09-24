import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../types.js';
import { relativizerStandIn } from './relativizerStandIn.js';
import { topicLink } from './topicLink.js';

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
 * would take there: "in which", "in dem", "nella quale", "al que".
 */
export function relativeGapComplement(
  np: ResolvedNounPhrase,
  forms: Record<string, string>,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  const rel = np.relative;
  if (!rel || rel.headRole === 'subject' || rel.headRole === 'directObject' || rel.headRole === 'possessor'
    || rel.headRole === 'agent' || rel.headRole === 'predicative' || rel.headRole === 'objectPredicative') return undefined;
  // A topic gap keeps the preposition its verb governs the topic with, as the complement itself does
  // (see `resolveComplements`): "the cat of which one thinks" is it "al quale si pensa", fr "auquel
  // on pense", de "an den man denkt", not the generic topic word *speak* takes (B81).
  const link = rel.headRole === 'topic' ? topicLink(rel.verbPhrase.verb.forms) : '';
  const complement: ResolvedComplement = {
    phrase: relativizerStandIn(np, forms),
    ...(rel.headSpecifiers ? { specifiers: rel.headSpecifiers } : {}),
    ...(link ? { link } : {}),
  };
  return { [rel.headRole]: complement };
}
