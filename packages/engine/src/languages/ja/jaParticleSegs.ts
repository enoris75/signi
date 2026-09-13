import type { ResolvedNounElement, RubySegment } from '../../types.js';
import { JA_NEGATIVE_DETERMINER } from './ja.consts.js';
import { isNegativeGroup } from './isNegativeGroup.js';

/** The particles the circumfix's も replaces outright; every other particle stays in front of it. */
const REPLACED_BY_MO: ReadonlySet<string> = new Set(['', 'が', 'を', 'は']);

/**
 * The case particle after a noun group. A `no` group closes its どの … も circumfix here: も replaces
 * が, を and は (どの猫も, どのネズミも) and follows any other particle (どの家でも, どの犬にも, どの市場からも,
 * どの犬のためにも), which npSegs cannot know.
 */
export function jaParticleSegs(el: ResolvedNounElement, particle: string): RubySegment[] {
  if (!isNegativeGroup(el)) return particle ? [{ t: particle }] : [];
  const mo = { t: JA_NEGATIVE_DETERMINER.post };
  return REPLACED_BY_MO.has(particle) ? [mo] : [{ t: particle }, mo];
}
