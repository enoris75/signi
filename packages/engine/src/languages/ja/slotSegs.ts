import type { ResolvedNounElement, RubySegment } from '../../types.js';
import { elSegs } from './elSegs.js';
import { jaParticleSegs } from './jaParticleSegs.js';

/**
 * A noun slot with its particle: the conjuncts (`elSegs`) and the particle the group takes once
 * (`jaParticleSegs`). Both halves read the particle, because a correlative group (P09-E26) writes
 * も after every conjunct — 猫も犬も — which only works where も replaces the particle outright.
 */
export function slotSegs(el: ResolvedNounElement, particle: string): RubySegment[] {
  return [...elSegs(el, particle), ...jaParticleSegs(el, particle)];
}
