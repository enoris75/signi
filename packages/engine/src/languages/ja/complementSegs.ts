import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, RubySegment } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { CAUSE_PARTICLE, JA_DEGREE, PARTICLE, REL_NOUN, REL_NOUN_READING } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaParticleSegs } from './jaParticleSegs.js';
import { npSegs } from './npSegs.js';
import { wordSeg } from './wordSeg.js';

/**
 * The complements in Japanese order, each with its particle. `existential` marks a clause whose verb
 * is いる / ある: its locative states where the subject is, with に (家にいます), not the で of a place
 * where something happens (家で食べます).
 */
export function complementSegs(complements?: Partial<Record<ComplementType, ResolvedComplement>>, existential = false): RubySegment[] {
  if (!complements) return [];
  const segs: RubySegment[] = [];
  for (const type of COMPLEMENT_RENDER_ORDER) {
    const c = complements[type];
    if (!c) continue;
    // Subject complement (of なる/見える etc.), by head type:
    //  · i-adjective (…い) → adverbial く-form, no particle (楽しい → "楽しくなる")
    //  · na-adjective (…な) or の-adjective (…の) → drop the particle, then に (幸せな → "幸せになる",
    //    茶色の → "茶色になる")
    //  · た-adjective (…た) → the state 〜ている as a ように clause (疲れた → "疲れているように見える")
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
        if (!isAdj) {
          segs.push(...npSegs(np));
          takesNi = true;
          return;
        }
        const { base, reading } = jaComparisonAdj(np.head);
        const deg = JA_DEGREE[adjDegree(np.head)];
        if (deg) segs.push({ t: deg });
        // By class (see `jaAdjClass`): an i-adjective takes its く-form, a na- or の-adjective its bare
        // stem + に (幸せに, 茶色に), and a た-adjective the state 〜ている as a ように clause, which takes no
        // に either (疲れているように思える).
        const { kind, stem, reading: stemReading } = jaAdjClass(base, reading);
        if (kind === 'i') {
          segs.push(wordSeg(`${stem}く`, stemReading === undefined ? undefined : `${stemReading}く`));
          takesNi = false;
        } else if (kind === 'ta') {
          segs.push(wordSeg(stem, stemReading), { t: 'いるように' });
          takesNi = false;
        } else {
          segs.push(wordSeg(stem, stemReading));
          takesNi = true;
        }
      });
      if (takesNi) segs.push(...jaParticleSegs(c.phrase, 'に'));
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
        segs.push(...elSegs(c.phrase), ...jaParticleSegs(c.phrase, 'を'));
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
      type === 'locative' && existential ? 'に'
      : type === 'cause' ? CAUSE_PARTICLE[causeSentiment(c)]
      : type === 'manner' && mannerRelation(firstConjunct(c.phrase).head.forms) === 'similative' ? 'のように'
      : PARTICLE[type];
    // A `no` group closes its circumfix here: も after the particle (どの家でも, どの犬にも), or in place of
    // the route's を (どの市場も).
    segs.push(...jaParticleSegs(c.phrase, particle));
  }
  return segs;
}
