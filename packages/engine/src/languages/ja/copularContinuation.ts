import type { ConceptForms, ResolvedComplement, RubySegment } from '../../types.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';
import { npSegs } from './npSegs.js';
import { wordSeg } from './wordSeg.js';

/** The verb surfaces the engine conjugates from, each with its `_reading` (`reading` for `base`). */
const SURFACES = ['base', 'masu_present', 'te', 'nai', 'passive', 'potential'];
const readingKey = (key: string): string => (key === 'base' ? 'reading' : `${key}_reading`);

/**
 * A stem-compounding governor (続ける, `ja_complement: 'stem'`) over a copular complement, which the
 * translator hands over as the governor marked `copular_compound` beside the clause's predicative
 * (see `fuseGovernedVerb`, A315). 続ける compounds on the stem of the copula's ある, and the predicate
 * stands before it in its connective form: a noun or な-adjective with で (幸せであり続けます,
 * 友達であり続けます), an い-adjective in 〜く (大きくあり続けます). A た-adjective names a state that is
 * 〜ている, so it compounds on いる's stem (疲れてい続けます), and the 〜すぎる verb an intensifier builds
 * on its own (大きすぎ続けます).
 *
 * Returns the predicate's segments, which go right before the verb, and the compound verb, which
 * conjugates as any verb does (あり続けません, あり続けました, あり続ける猫).
 */
export function copularContinuation(
  governor: ConceptForms,
  predicative: ResolvedComplement,
): { segs: RubySegment[]; verb: ConceptForms } {
  const np = predicative.phrase.conjuncts[0];
  const { segs, stem } = ((): { segs: RubySegment[]; stem: string } => {
    if (np.head.forms['role'] !== 'adjective') return { segs: [...npSegs(np), { t: 'で' }], stem: 'あり' };
    const { base, reading, verbal } = jaComparisonAdj(np.head);
    const cls = jaAdjClass(base, reading, np.head.forms['relational'] === '1', verbal);
    const word = [...jaDegreeSegs(np.head, np.standard), wordSeg(cls.stem, cls.reading)];
    switch (cls.kind) {
      case 'i': return { segs: [...word, { t: 'く' }], stem: 'あり' };
      case 'na': return { segs: [...word, { t: `${cls.predicative}で` }], stem: 'あり' };
      case 'ta': return { segs: word, stem: 'い' };
      case 'ru': return { segs: word, stem: '' };
    }
  })();
  const forms: Record<string, string> = { ...governor.forms };
  delete forms['copular_compound'];
  for (const key of SURFACES) {
    const surface = governor.forms[key];
    if (!surface) continue;
    forms[key] = `${stem}${surface}`;
    forms[readingKey(key)] = `${stem}${governor.forms[readingKey(key)] ?? surface}`;
  }
  return { segs, verb: { conceptId: governor.conceptId, forms } };
}
