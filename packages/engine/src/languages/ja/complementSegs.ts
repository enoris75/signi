import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, type ComplementType } from '@signi/shared';
import { abstractionLevel, adjDegree, causeSentiment, firstConjunct, mannerRelation, pathSpecifier, type ResolvedComplement, type RubySegment } from '../../types.js';
import { CAUSE_PARTICLE, JA_DEGREE, PARTICLE, REL_NOUN, REL_NOUN_READING } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { isNegativeGroup } from './isNegativeGroup.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { npSegs } from './npSegs.js';
import { wordSeg } from './wordSeg.js';

export function complementSegs(complements?: Partial<Record<ComplementType, ResolvedComplement>>): RubySegment[] {
  if (!complements) return [];
  const segs: RubySegment[] = [];
  for (const type of COMPLEMENT_RENDER_ORDER) {
    const c = complements[type];
    if (!c) continue;
    // Subject complement (of なる/見える etc.), by head type:
    //  · i-adjective (…い) → adverbial く-form, no particle (楽しい → "楽しくなる")
    //  · na-adjective (…な) → drop the attributive な, then に (幸せな → "幸せになる")
    //  · noun → 〜に (伝説 → "伝説になる")
    // The furigana reading tracks the same trailing-mora substitution. A predicate adjective
    // takes its degree adverb before it, as an attributive one does (もっと楽しくなる).
    if (type === 'predicative') {
      // Coordinated conjuncts are strung with と / か, and the に — like every other particle in
      // Japanese — attaches once, to the group: 「幸せか疲れに見える」, never 「幸せにか疲れに」.
      // An i-adjective takes no に at all (it is already adverbial in the く-form), so the
      // particle is decided by the *last* conjunct, the one the predicate actually follows.
      // (Japanese would more idiomatically chain predicate adjectives with the て-form —
      // 楽しくて疲れて — so a coordinated *adjective* predicate here is an approximation.)
      const conj = c.phrase.conjunction === 'or' ? 'か' : 'と';
      let takesNi = false;
      c.phrase.conjuncts.forEach((np, i) => {
        if (i > 0) segs.push({ t: conj });
        const f = np.head.forms;
        const isAdj = f['role'] === 'adjective';
        // The lowered degrees negate the adjective (幸せな → 幸せではない, itself an い-adjective).
        const { base, reading } = isAdj ? jaComparisonAdj(np.head) : { base: f['base'] ?? '', reading: f['reading'] };
        const deg = isAdj ? JA_DEGREE[adjDegree(np.head)] : '';
        if (deg) segs.push({ t: deg });
        if (isAdj && base.endsWith('い')) {
          segs.push(wordSeg(
            `${base.slice(0, -1)}く`,
            reading?.endsWith('い') ? `${reading.slice(0, -1)}く` : reading,
          ));
          takesNi = false;
        } else if (isAdj && base.endsWith('な')) {
          segs.push(wordSeg(base.slice(0, -1), reading?.endsWith('な') ? reading.slice(0, -1) : reading));
          takesNi = true;
        } else {
          segs.push(...npSegs(np));
          takesNi = true;
        }
      });
      if (takesNi && !isNegativeGroup(c.phrase)) segs.push({ t: 'に' });
      continue;
    }
    // An instrument presented as an action, with the noun phrase as its direct object (を). The
    // process level takes the te-form, which is exactly how Japanese marks the means of an act
    // ("単語を選んで始める"); the concept level nominalises the verb with こと and marks that with
    // で — "単語を選ぶことで", by means of the act of choosing.
    if (type === 'instrumental' && c.action) {
      const level = abstractionLevel(c);
      if (level !== 'object') {
        const v = c.action.verb.forms;
        segs.push(...elSegs(c.phrase), ...(isNegativeGroup(c.phrase) ? [] : [{ t: 'を' }]));
        const adverb = c.action.modifier;
        if (adverb) segs.push(wordSeg(adverb.forms['base'] ?? '', adverb.forms['reading']));
        if (level === 'process') {
          segs.push(wordSeg(v['te'] ?? v['base'] ?? '', v['te_reading']));
        } else {
          segs.push(wordSeg(v['base'] ?? '', v['reading']), { t: 'ことで' });
        }
        continue;
      }
    }
    // The particle below attaches to the whole group, not to each conjunct: 「猫と犬に」.
    segs.push(...elSegs(c.phrase));
    // The relational noun sits between the place and its particle, for a path and a place alike:
    // 市場の下を行きます (goes under the market), ベッドの下にいます (is under the bed).
    if (type === 'route' || type === 'locative') {
      const spec = pathSpecifier(c, type === 'locative' ? DEFAULT_LOCATIVE_SPECIFIER : DEFAULT_ROUTE_SPECIFIER);
      if (REL_NOUN[spec]) segs.push(wordSeg(REL_NOUN[spec], REL_NOUN_READING[spec]));
    }
    // Manner: a similative head takes 〜のように ("風のように" = like the wind), not the で the
    // means/measure/mode relations share; every other complement uses its fixed particle.
    const particle =
      type === 'cause' ? CAUSE_PARTICLE[causeSentiment(c)]
      : type === 'manner' && mannerRelation(firstConjunct(c.phrase).head.forms) === 'similative' ? 'のように'
      : PARTICLE[type];
    // A `no` group ends in も, which replaces this case particle (どの市場も, not どの市場もに).
    if (!isNegativeGroup(c.phrase)) segs.push({ t: particle });
  }
  return segs;
}
