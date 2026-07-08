import { COMPLEMENT_RENDER_ORDER, type CauseSentiment, type ComplementType, type Degree, type PathSpecifier, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type RubySegment, type LanguageEngine, type ResolvedPhrase } from '../types.js';

// Prenominal degree adverb (もっと大きい "bigger", 最も大きい "biggest"). Japanese comparison
// is largely contextual (より marks the standard); these adverbs are the closest MVP. 'less'
// (あまり) and 'least' properly pair with a negative predicate, which is out of scope here —
// 'least' reuses 最も as an approximation.
const JA_DEGREE: Record<Degree, string> = {
  positive: '', more: 'もっと', most: '最も', less: 'あまり', least: '最も', equally: '同じくらい',
};

/** A segment for one word: attach the furigana reading only when it differs from the surface. */
function wordSeg(surface: string, reading?: string): RubySegment {
  return reading && reading !== surface ? { t: surface, r: reading } : { t: surface };
}

/** Postposition particle per complement type. (Route を is safe: motion verbs are intransitive.) */
const PARTICLE: Record<ComplementType, string> = {
  locative: 'で',
  direction: 'へ',
  source: 'から',
  route: 'を',
  // Cause/reason: the neutral compound postposition "のために"; the sentiment swaps it (see
  // CAUSE_PARTICLE). Kept here for the type — cause is overridden per-sentiment below.
  cause: 'のために',
  // Terminus (dative recipient) — the same に that marks the indirect object ("猫に").
  terminus: 'に',
  // Subject complement: a noun/na-adjective predicate takes に (伝説になる); an i-adjective
  // takes its adverbial く-form with no particle (楽しくなる). Handled specially in
  // complementSegs — this に is the noun/na-adjective default.
  predicative: 'に',
};

/**
 * Cause postposition per sentiment — Japanese marks the stance cleanly: neutral のために
 * ("for the sake of / because of"), negative のせいで ("owing to … fault"), positive のおかげで
 * ("thanks to"). All written in kana, so no furigana reading is attached.
 */
const CAUSE_PARTICLE: Record<CauseSentiment, string> = {
  neutral: 'のために',
  negative: 'のせいで',
  positive: 'のおかげで',
};

/** Path relations expressed via a relational noun before を ("橋の下を" = under the bridge). */
const REL_NOUN: Record<PathSpecifier, string> = {
  through: '',
  under: 'の下',
  over: 'の上',
  around: 'の周り',
  behind: 'の後ろ',
  in_front_of: 'の前',
};

/** Readings for the relational nouns above (word-level furigana over the の+kanji run). */
const REL_NOUN_READING: Record<PathSpecifier, string> = {
  through: '',
  under: 'のした',
  over: 'のうえ',
  around: 'のまわり',
  behind: 'のうしろ',
  in_front_of: 'のまえ',
};

/**
 * Segments for a noun phrase: [relative clause] [adjectives] noun. Adjectives are
 * separated by a space and the noun appended directly (matching the string form
 * "大きい 小さい猫"); any relative clause is prepended (see below).
 */
function npSegs(np: ResolvedNounPhrase): RubySegment[] {
  const core: RubySegment[] = [];
  // A possessor is prenominal, marked by の ("猫の本"); recursing handles its own
  // adjectives / nested possessor / relative clause ("子供の猫の本").
  if (np.possessor) core.push(...npSegs(np.possessor), { t: 'の' });
  // Attributive nouns ("sail boat") are also の-linked in Japanese (ガラスのコップ); the
  // relation is neutralised, so every relation renders the same の.
  for (const m of np.nounModifiers) {
    const base = m.concept.forms['base'];
    if (base) core.push(wordSeg(base, m.concept.forms['reading']), { t: 'の' });
  }
  const adjSegs: RubySegment[] = [];
  for (const a of np.adjectives) {
    const base = a.forms['base'] ?? '';
    if (!base) continue;
    if (adjSegs.length) adjSegs.push({ t: ' ' });
    // Prenominal degree adverb bound directly to its adjective (もっと大きい), no space.
    const deg = JA_DEGREE[adjDegree(a)];
    if (deg) adjSegs.push({ t: deg });
    adjSegs.push(wordSeg(base, a.forms['reading']));
  }
  core.push(...adjSegs);
  const head = np.head.forms;
  core.push(wordSeg(head['base'] ?? '', head['reading']));
  // A relative clause is prenominal in Japanese: the whole predicate precedes the head
  // noun with no relative pronoun (泣いた少年 = "the boy who cried"). For a non-subject
  // (e.g. object) relative the clause's own subject leads, marked by が (私が読む本 = "the
  // book I read"); the gap slot is already absent from the clause. The clause verb takes
  // the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました of a main
  // clause — Japanese requires plain form on a prenominal predicate (see plainVerbSeg).
  const rel = np.relative;
  if (!rel) return core;
  const clauseSubjectSegs: RubySegment[] =
    rel.headRole !== 'subject' && rel.subject ? [...npSegs(rel.subject), { t: 'が' }] : [];
  return [...clauseSubjectSegs, ...predicateSegs(rel.verbPhrase, rel.directObject, rel.indirectObject, rel.complements), ...core];
}

/**
 * The verb segment. Japanese has no dedicated future, so future reuses the present (masu)
 * form; the polite past is the masu-stem + ました (negative ませんでした). The reading is
 * derived the same way from the masu-stem's reading so the furigana tracks the surface.
 */
function verbSeg(verb: ResolvedVerbPhrase['verb'], negative: boolean | undefined, tense: Tense): RubySegment {
  const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
  const masuReading = verb.forms['masu_present_reading'];
  const stem = masuPresent.endsWith('ます') ? masuPresent.slice(0, -2) : null;
  const readingStem = masuReading?.endsWith('ます') ? masuReading.slice(0, -2) : undefined;

  let surface: string;
  let suffix: string | null = null;
  if (tense === 'past' && stem !== null) {
    suffix = negative ? 'ませんでした' : 'ました';
    surface = stem + suffix;
  } else if (negative && stem !== null) {
    suffix = 'ません';
    surface = stem + suffix;
  } else {
    surface = masuPresent; // present / future — plain masu form
  }
  const reading = suffix === null
    ? masuReading
    : readingStem !== undefined ? readingStem + suffix : undefined;
  return wordSeg(surface, reading);
}

function complementSegs(complements?: Partial<Record<ComplementType, ResolvedComplement>>): RubySegment[] {
  if (!complements) return [];
  const segs: RubySegment[] = [];
  for (const type of COMPLEMENT_RENDER_ORDER) {
    const c = complements[type];
    if (!c) continue;
    // Subject complement (of なる/見える etc.), by head type:
    //  · i-adjective (…い) → adverbial く-form, no particle (楽しい → "楽しくなる")
    //  · na-adjective (…な) → drop the attributive な, then に (幸せな → "幸せになる")
    //  · noun → 〜に (伝説 → "伝説になる")
    // The furigana reading tracks the same trailing-mora substitution.
    if (type === 'predicative') {
      const f = c.phrase.head.forms;
      const base = f['base'] ?? '';
      const reading = f['reading'];
      const isAdj = f['role'] === 'adjective';
      if (isAdj && base.endsWith('い')) {
        segs.push(wordSeg(
          `${base.slice(0, -1)}く`,
          reading?.endsWith('い') ? `${reading.slice(0, -1)}く` : reading,
        ));
      } else if (isAdj && base.endsWith('な')) {
        segs.push(
          wordSeg(base.slice(0, -1), reading?.endsWith('な') ? reading.slice(0, -1) : reading),
          { t: 'に' },
        );
      } else {
        segs.push(...npSegs(c.phrase), { t: 'に' });
      }
      continue;
    }
    segs.push(...npSegs(c.phrase));
    if (type === 'route') {
      const spec = pathSpecifier(c);
      if (REL_NOUN[spec]) segs.push(wordSeg(REL_NOUN[spec], REL_NOUN_READING[spec]));
    }
    segs.push({ t: type === 'cause' ? CAUSE_PARTICLE[causeSentiment(c)] : PARTICLE[type] });
  }
  return segs;
}

/**
 * The predicate half of a phrase, in Japanese order: complements IndObj+に DirectObj+を
 * Adv V. Shared by the main sentence (after 〜は) and by prenominal relative clauses.
 */
function predicateSegs(
  verbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounPhrase | undefined,
  indirectObject: ResolvedNounPhrase | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
): RubySegment[] {
  const { verb, negative, modifier, tense = 'present' } = verbPhrase;
  const segs: RubySegment[] = [];
  segs.push(...complementSegs(complements));
  if (indirectObject) segs.push(...npSegs(indirectObject), { t: 'に' });
  if (directObject) segs.push(...npSegs(directObject), { t: 'を' });
  if (modifier) {
    const base = modifier.forms['base'] ?? '';
    if (base) segs.push(wordSeg(base, modifier.forms['reading']));
  }
  segs.push(verbSeg(verb, negative, tense));
  return segs;
}

/**
 * Japanese word order: S IndObj+に DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
function buildSegments(phrase: ResolvedPhrase): RubySegment[] {
  // Verbless period: a bare noun phrase (a title like "最新ニュース") — no topic は, no predicate.
  if (!phrase.verbPhrase) return npSegs(phrase.subject);
  const segs: RubySegment[] = [];
  segs.push(...npSegs(phrase.subject), { t: 'は' });
  segs.push(...predicateSegs(phrase.verbPhrase, phrase.directObject, phrase.indirectObject, phrase.complements));
  return segs;
}

export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  render(phrase: ResolvedPhrase): string {
    return buildSegments(phrase)
      .map((s) => s.t)
      .join('')
      .trim();
  },
  renderRuby(phrase: ResolvedPhrase): RubySegment[] {
    return buildSegments(phrase);
  },
};
