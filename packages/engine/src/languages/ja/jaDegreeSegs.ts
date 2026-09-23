import type { ConceptForms, ResolvedNounElement, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { JA_DOMAIN, JA_STANDARD } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { jaDegreeAdverb } from './jaDegreeAdverb.js';
import { jaIntensifierSeg } from './jaIntensifierSeg.js';

/**
 * What leads a compared adjective `adj`: its standard of comparison, its intensifier and its degree
 * adverb, in that order — 犬よりずっと大きい, とても大きい. The standard takes the degree
 * adverb's place rather than joining it (犬より大きい, not 犬よりもっと大きい; see `JA_STANDARD`, P09-E5),
 * and so does a comparative intensifier (ずっと大きい; see `jaDegreeAdverb`, A248). A lowered degree
 * keeps its negated adjective, which `jaComparisonAdj` builds: 犬ほど大きくない. The standard is a
 * whole noun element, so a coordinated one joins with と as any does (犬と男より).
 *
 * A superlative's set (`forms['domain']`, P09-E19) stands in the same place with の中で, but keeps the
 * adverb: 動物の中で最も大きい, 動物の中で最も大きくない.
 *
 * `adj` is the predicate adjective (the phrase's head, with its `standard`) or an attributive one
 * with the phrase's `adjectiveStandard` (P09-E18): 犬より大きい猫, exactly the relative clause's shape.
 */
export function jaDegreeSegs(adj: ConceptForms, standard: ResolvedNounElement | undefined): RubySegment[] {
  const degree = adjDegree(adj);
  const domain = adj.forms['domain'] === '1';
  const particle = standard ? (domain ? JA_DOMAIN : JA_STANDARD[degree]) : undefined;
  const lead: RubySegment[] = standard && particle ? [...elSegs(standard), { t: particle }] : [];
  const intensifier = jaIntensifierSeg(adj);
  const adverb = lead.length && !domain ? '' : jaDegreeAdverb(adj);
  return [...lead, ...(intensifier ? [intensifier] : []), ...(adverb ? [{ t: adverb }] : [])];
}
