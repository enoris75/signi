import type { ResolvedNounElement, RubySegment } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementSegs } from './complementSegs.js';

/**
 * A complement-definition gloss fragment (すべての場所で, より高い場所へ): the place noun phrase closed by
 * the particle of the locative or direction complement it names, by the renderer a clause's
 * complements take — the place where something happens takes で, a goal へ, and a relation its
 * relational noun before the particle (グループの中へ). With no verb there is no existential or
 * verb's `locative_particle` to ask for に, so a locative keeps its default で — unless its noun asks
 * for に itself, as a direction does (反対の方向に, A220).
 */
export function complementGlossSegs(el: ResolvedNounElement): RubySegment[] {
  return complementSegs(glossComplement(el));
}
