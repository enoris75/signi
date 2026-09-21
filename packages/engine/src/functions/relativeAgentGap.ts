import type { ResolvedNounElement, ResolvedNounPhrase } from '../types.js';
import { relativizerStandIn } from './relativizerStandIn.js';

/**
 * The gapped agent of a **passive** relative clause whose head is the one who acts — "the child **by
 * whom** the book is written" — as a stand-in for the head that each engine renders through its own
 * by-phrase (`agentPhrase`), which gives the relativizer the adposition and contraction an agent takes:
 * "by whom", "dal quale", "par lequel", "por el que", "pelo qual". `undefined` for any other gap.
 *
 * The translator moves a subject gap here when the clause turns passive (see ResolvedRelativeClause),
 * and never in a language that cannot relativise an agent (`RELATIVIZES_AGENT`).
 */
export function relativeAgentGap(np: ResolvedNounPhrase, forms: Record<string, string>): ResolvedNounElement | undefined {
  return np.relative?.headRole === 'agent' ? relativizerStandIn(np, forms) : undefined;
}
