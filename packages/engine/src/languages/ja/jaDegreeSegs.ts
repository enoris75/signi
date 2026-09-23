import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { JA_STANDARD } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { jaDegreeAdverb } from './jaDegreeAdverb.js';
import { jaIntensifierSeg } from './jaIntensifierSeg.js';

/**
 * What leads a predicate adjective: its standard of comparison, its intensifier and its degree
 * adverb, in that order — 犬よりずっと大きい, とても大きい. The standard takes the degree
 * adverb's place rather than joining it (犬より大きい, not 犬よりもっと大きい; see `JA_STANDARD`, P09-E5),
 * and so does a comparative intensifier (ずっと大きい; see `jaDegreeAdverb`, A248). A lowered degree
 * keeps its negated adjective, which `jaComparisonAdj` builds: 犬ほど大きくない. The standard is a
 * whole noun element, so a coordinated one joins with と as any does (犬と男より).
 */
export function jaDegreeSegs(np: ResolvedNounPhrase): RubySegment[] {
  const degree = adjDegree(np.head);
  const particle = np.standard ? JA_STANDARD[degree] : undefined;
  const standard: RubySegment[] = np.standard && particle ? [...elSegs(np.standard), { t: particle }] : [];
  const intensifier = jaIntensifierSeg(np.head);
  const adverb = standard.length ? '' : jaDegreeAdverb(np.head);
  return [...standard, ...(intensifier ? [intensifier] : []), ...(adverb ? [{ t: adverb }] : [])];
}
