import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, DEFAULT_ROUTE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, RubySegment } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { causeNegative } from '../../functions/causeNegative.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { CAUSE_PARTICLE, JA_DEGREE, JA_ESSIVE, JA_PRIVATIVE, JA_TEMPORAL, PARTICLE, PATH_CITATION, REL_NOUN, REL_NOUN_READING } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { isLoweredDegree } from './isLoweredDegree.js';
import { jaAdjClass } from './jaAdjClass.js';
import { jaIntensifierSeg } from './jaIntensifierSeg.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { jaParticleSegs } from './jaParticleSegs.js';
import { npSegs } from './npSegs.js';
import { predicateLinkSegs } from './predicateLinkSegs.js';
import { wordSeg } from './wordSeg.js';

// The cause particle, denied where the plan denies the cause rather than the clause (see
// `Complement.negative`). Japanese negates such a phrase with ではなく in place of the particle's own
// trailing に / で: 犬のために → 犬のためではなく, 犬のおかげで → 犬のおかげではなく, 犬のせいで →
// 犬のせいではなく. The verb is untouched, so 「猫は犬のためではなく走ります」 says the cat runs and the
// dog is not why.
function jaCauseParticle(c: ResolvedComplement): string {
  const particle = CAUSE_PARTICLE[causeSentiment(c)];
  return causeNegative(c) ? `${particle.slice(0, -1)}ではなく` : particle;
}

// The Japanese render order: the shared one with the subject complement moved to the end, against
// the verb it predicates (A186).
const JA_COMPLEMENT_ORDER: ComplementType[] = [
  ...COMPLEMENT_RENDER_ORDER.filter((type) => type !== 'predicative'),
  'predicative',
];

/**
 * The complements in Japanese order, each with its particle. `locativeParticle` overrides the one a
 * `locative` takes: the default で is the place where something happens (家で食べます), and a verb whose
 * place is where something *is* or *ends up* asks for に instead — the existential いる / ある
 * (家にいます, A109), and the lexemes seeding `locative_particle`, 住む and 閉じ込める (家に住みます, A190).
 * The caller decides which; see `predicateSegs`. Failing that, a noun seeding `locative_particle` asks
 * for に in plain containment — a direction, which is no place an act goes on in (方向に, A220).
 *
 * The subject complement comes last, straight before なる / 思える, where the shared
 * `COMPLEMENT_RENDER_ORDER` — English and Romance order — leads with it. Anything between the two
 * attaches to the verb instead: 「伝説に犬のためになります」 also reads "became beneficial to the dog"
 * (犬のためになる), and 「伝説に犬となりました」 "became a dog" (犬となる) — A186. The object
 * predicate keeps its place, which is already beside its own object (家を刑務所に変える).
 */
export function complementSegs(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  locativeParticle?: string,
): RubySegment[] {
  if (!complements) return [];
  const segs: RubySegment[] = [];
  for (const type of JA_COMPLEMENT_ORDER) {
    const c = complements[type];
    if (!c) continue;
    // The factitive object complement takes the same shapes as the subject complement, and for the
    // same reason: 「家を刑務所にする」 is 「家が刑務所になる」 under a causer, so an adjective head
    // takes its く-form (家を美しくする) and a noun head the に. Only the essive differs — として
    // attaches to the word as it stands, or to a na-adjective's stem (A224) — so it falls through to
    // the particle path below.
    const factitive = type === 'objectPredicative' && objectPredication(c) !== 'essive';
    // Subject complement (of なる/見える etc.), by head type:
    //  · i-adjective (…い) → adverbial く-form, no particle (楽しい → "楽しくなる")
    //  · na-adjective (…な) or の-adjective (…の) → drop the particle, then に (幸せな → "幸せになる",
    //    茶色の → "茶色になる")
    //  · た-adjective (…た) → the state 〜ている as a ように clause (疲れた → "疲れているように見える")
    //  · noun → 〜に (伝説 → "伝説になる")
    // The furigana reading tracks the same trailing-mora substitution. A predicate adjective
    // takes its degree adverb before it, as an attributive one does (もっと楽しくなる).
    if (type === 'predicative' || factitive) {
      // Coordinated conjuncts: "and" chains every conjunct but the last in its te-form (B12), as the
      // copula does (大きくて幸せになる, 伝説で犬に思える, 疲れていて幸せに思える; see `predicateLinkSegs`);
      // "or" strings them with か. Either way the に — like every other particle in Japanese —
      // attaches once, after the last conjunct: 「幸せか伝説に見える」, never 「幸せにか伝説に」. An
      // i-adjective takes no に at all (it is already adverbial in the く-form), so the particle is
      // decided by the *last* conjunct, the one the predicate actually follows.
      const { conjuncts } = c.phrase;
      const or = c.phrase.conjunction === 'or';
      let takesNi = false;
      conjuncts.forEach((np, i) => {
        if (!or && i < conjuncts.length - 1) {
          segs.push(...predicateLinkSegs(np, 'te'));
          return;
        }
        if (i > 0 && or) segs.push({ t: 'か' });
        const f = np.head.forms;
        const isAdj = f['role'] === 'adjective';
        // The lowered degrees negate the adjective (幸せな → 幸せではない, itself an い-adjective).
        if (!isAdj) {
          segs.push(...npSegs(np));
          takesNi = true;
          return;
        }
        const { base, reading, verbal } = jaComparisonAdj(np.head);
        const intensifier = jaIntensifierSeg(np.head);
        if (intensifier) segs.push(intensifier);
        const deg = JA_DEGREE[adjDegree(np.head)];
        if (deg) segs.push({ t: deg });
        // By class (see `jaAdjClass`): an i-adjective takes its く-form, a na- or の-adjective its bare
        // stem + に (幸せに, 茶色に), and a た-adjective the state 〜ている as a ように clause, which takes no
        // に either (疲れているように思える).
        const { kind, stem, reading: stemReading } = jaAdjClass(base, reading, false, verbal);
        if (kind === 'i') {
          segs.push(wordSeg(`${stem}く`, stemReading === undefined ? undefined : `${stemReading}く`));
          takesNi = false;
        } else if (kind === 'ta') {
          segs.push(wordSeg(stem, stemReading), { t: 'いるように' });
          takesNi = false;
        } else if (kind === 'ru') {
          // A verb becomes a ように clause, as the た-adjective's state does: 大きすぎるようになる (C33).
          segs.push(wordSeg(stem, stemReading), { t: 'るように' });
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
        // Denied (the privative, P09-E2), the te-form becomes the ない-form + で — 単語を選ばないで
        // 始める, "starts without choosing a word" — and the nominalised act takes なしで for its で:
        // 単語を選ぶことなしで. A verb seeding no ない-form keeps the positive te-form rather than
        // guess at one.
        const privative = isPrivative(type, c);
        if (level === 'process' && privative && v['nai']) {
          segs.push(wordSeg(`${v['nai']}で`, v['nai_reading'] ? `${v['nai_reading']}で` : undefined));
        } else if (level === 'process') {
          segs.push(wordSeg(v['te'] ?? v['base'] ?? '', v['te_reading']));
        } else {
          segs.push(wordSeg(v['base'] ?? '', v['reading']), { t: privative ? `こと${JA_PRIVATIVE}` : 'ことで' });
        }
        continue;
      }
    }
    // The particle below attaches to the whole group, not to each conjunct: 「猫と犬に」.
    // The essive's として is no noun, so a na-adjective (or a noun-adjective linked by の) takes it on
    // its stem, not on the な / の that links it to a noun after it: 有効として, 茶色として (A224). A lone
    // adjective only; an i- or た-adjective keeps its form as it stands.
    const [lone] = c.phrase.conjuncts;
    const essiveAdj = type === 'objectPredicative' && c.phrase.conjuncts.length === 1 && lone?.head.forms['role'] === 'adjective'
      ? jaAdjClass(lone.head.forms['base'] ?? '', lone.head.forms['reading'])
      : undefined;
    if (essiveAdj?.kind === 'na' && lone) {
      // The stem takes its degree adverb ahead of it, as the factitive's does (もっと幸せとして,
      // 最も茶色として, 同じくらい幸せとして — A232). Not the lowered two: それほど and 最も are
      // negative-polarity there (see `JA_DEGREE`) and want a negated adjective, which the factitive
      // spells ではなく and として has no counterpart for, so "less" and "least" still drop the degree.
      const degree = isLoweredDegree(lone.head) ? '' : JA_DEGREE[adjDegree(lone.head)];
      if (degree) segs.push({ t: degree });
      segs.push(wordSeg(essiveAdj.stem, essiveAdj.reading));
    } else segs.push(...elSegs(c.phrase));
    // The relational noun sits between the place and its particle, for a path and a place alike:
    // 市場の下を行きます (goes under the market), ベッドの下にいます (is under the bed).
    const spec = type === 'route' || type === 'locative'
      ? pathSpecifier(c, type === 'locative' ? DEFAULT_LOCATIVE_SPECIFIER : DEFAULT_ROUTE_SPECIFIER)
      : undefined;
    if (spec && REL_NOUN[spec]) segs.push(wordSeg(REL_NOUN[spec], REL_NOUN_READING[spec]));
    // A time: the relational noun of its relation, before the particle. 「瞬間前に」 ("a moment ago")
    // against 「この日の前に」 ("before this day") — the の is the whole difference, so each relation
    // names its own noun (see JA_TEMPORAL).
    if (type === 'temporal') {
      const { noun, reading } = JA_TEMPORAL[temporalRelation(c)];
      if (noun) segs.push(wordSeg(noun, reading));
    }
    // A direction naming a relation takes the same relational noun before its へ — 空気の中へ ("into
    // the air"), 家の後ろへ ("to behind the house"). Containment is the one that needs it: a *place*
    // spells it with に alone (空気に), but a goal's へ says only "towards", so without 中 the phrase
    // would be "towards the air". A bare direction adds no noun and stays the plain goal, 家へ.
    if (type === 'direction') {
      const goal = directionSpecifier(c);
      const rel = goal === 'in' ? 'の中' : goal ? REL_NOUN[goal] : '';
      if (rel) segs.push(wordSeg(rel, goal === 'in' ? 'のなか' : REL_NOUN_READING[goal!]));
    }
    // Manner: a similative head takes 〜のように ("風のように" = like the wind), not the で the
    // means/measure/mode relations share; every other complement uses its fixed particle.
    const particle =
      type === 'locative' && locativeParticle !== undefined ? locativeParticle
      // A place the action passes through (A176): a locative's で says only where, so `through` takes
      // the traversal tail 家を通って. A route keeps its bare を, which already marks the path (家を走ります).
      // A verb that puts something *at* the place wins over it: its に above says the same thing
      // better ("lives through the house" is 家に住みます), as the existential already did.
      : type === 'locative' && spec === 'through' ? PATH_CITATION.through
      // A noun can ask for に as a verb does (A220): a direction is no place an act goes on in, so one
      // runs 反対の方向に, never 反対の方向で ("running while standing in a direction"). Plain
      // containment only — a relation keeps its relational noun and で (反対の方向の下で).
      : type === 'locative' && spec === 'in' && firstConjunct(c.phrase).head.forms['locative_particle']
        ? firstConjunct(c.phrase).head.forms['locative_particle']!
      : type === 'cause' ? jaCauseParticle(c)
      // A time: the relation's particle, or — for `at` alone — the one the head noun names, as a
      // place noun names its own `locative_particle`.
      : type === 'temporal' ? (
        temporalRelation(c) === 'at' ? temporalPreposition(c, JA_TEMPORAL.at.particle) : JA_TEMPORAL[temporalRelation(c)].particle
      )
      : type === 'manner' && mannerRelation(firstConjunct(c.phrase).head.forms) === 'similative' ? 'のように'
      // The object complement: the factitive に ("この文を命令にする"), or として where the object is
      // only taken as the thing ("この文を条件として使う").
      : type === 'objectPredicative' && objectPredication(c) === 'essive' ? JA_ESSIVE
      // The instrument denied: ナイフなしで where it would be ナイフで (P09-E2).
      : isPrivative(type, c) ? JA_PRIVATIVE
      : PARTICLE[type];
    // A `no` group closes its circumfix here: も after the particle (どの家でも, どの犬にも), or in place of
    // the route's を (どの市場も).
    segs.push(...jaParticleSegs(c.phrase, particle));
  }
  return segs;
}
