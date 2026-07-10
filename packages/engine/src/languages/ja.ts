import { COMPLEMENT_RENDER_ORDER, type CauseSentiment, type ComplementType, type Degree, type PathSpecifier, type Tense } from '@signi/shared';
import { adjDegree, causeSentiment, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type RubySegment, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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
 * The polite stem of a verb (行きます → 行き) with its reading, or null when the lexeme
 * carries no ます form. Everything polite — the tense endings, the modal suffixes — is
 * built by appending to this.
 */
function masuStem(verb: ConceptForms): { stem: string; reading?: string } | null {
  const masuPresent = verb.forms['masu_present'] ?? '';
  if (!masuPresent.endsWith('ます')) return null;
  const masuReading = verb.forms['masu_present_reading'];
  return {
    stem: masuPresent.slice(0, -2),
    reading: masuReading?.endsWith('ます') ? masuReading.slice(0, -2) : undefined,
  };
}

/** The polite ending of a verb, by tense and polarity. Future reuses the present. */
function masuEnding(tense: Tense, negative: boolean): string {
  if (tense === 'past') return negative ? 'ませんでした' : 'ました';
  return negative ? 'ません' : 'ます';
}

/**
 * The verb segment. Japanese has no dedicated future, so future reuses the present (masu)
 * form; the polite past is the masu-stem + ました (negative ませんでした). The reading is
 * derived the same way from the masu-stem's reading so the furigana tracks the surface.
 */
function verbSeg(verb: ResolvedVerbPhrase['verb'], negative: boolean | undefined, tense: Tense): RubySegment {
  const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
  const st = masuStem(verb);
  if (!st || (tense !== 'past' && !negative)) {
    return wordSeg(masuPresent, verb.forms['masu_present_reading']); // present / future
  }
  const suffix = masuEnding(tense, negative === true);
  return wordSeg(st.stem + suffix, st.reading !== undefined ? st.reading + suffix : undefined);
}

// ── Modality ────────────────────────────────────────────────────────────────
// Japanese has no modal *verbs*: modality is a suffix on the predicate — 〜必要がある
// (obligation), 〜ことができる (ability), 〜たい (volition). Each modal lexeme therefore
// carries `governs` (the form of the element it attaches to), `suffix_dict` / `suffix_stem`
// (its own dictionary and polite-stem shapes, so an outer modal can attach to it in turn),
// and `kind` — 〜たい is an i-adjective and inflects like one, the others are verbs.
//
// Known gap: `aspect` is dropped under a modal. Stacking ～ています inside 〜必要がある is
// not something the language does periphrastically, so there is nothing to compose.

/** The form a Japanese modal suffix attaches to: the dictionary form, or the polite stem. */
type JaForm = 'dict' | 'stem';

/** The main verb in the form its governing modal demands (行く vs 行き). */
function verbFormSeg(verb: ConceptForms, form: JaForm): RubySegment {
  if (form === 'dict') return wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const st = masuStem(verb);
  return st ? wordSeg(st.stem, st.reading) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
}

/** A modal's own suffix in the requested form (〜ことができる vs 〜ことができ). */
function modalSuffixSeg(m: ConceptForms, form: JaForm): RubySegment {
  return wordSeg(m.forms[`suffix_${form}`] ?? '', m.forms[`suffix_${form}_reading`]);
}

/**
 * The outermost modal's inflected ending — it alone carries tense and polarity. A verb-kind
 * modal takes the ordinary ます paradigm on its stem (行く必要があります); 〜たい is an
 * i-adjective, so it inflects as one (行きたいです / 行きたくなかったです).
 */
function modalEndingSegs(m: ConceptForms, tense: Tense, negative: boolean): RubySegment[] {
  const past = tense === 'past';
  if (m.forms['kind'] !== 'iadj') {
    return [modalSuffixSeg(m, 'stem'), { t: masuEnding(tense, negative) }];
  }
  const dict = m.forms['suffix_dict'] ?? '';
  const dictReading = m.forms['suffix_dict_reading'];
  const ending = negative
    ? (past ? 'くなかったです' : 'くないです')
    : (past ? 'かったです' : 'いです');
  // Strip the adjective's final い; the ending supplies its own.
  return [wordSeg(dict.slice(0, -1), dictReading?.slice(0, -1)), { t: ending }];
}

/**
 * The modal chain, built inside-out. `modals[0]` is the outermost and is the only one
 * inflected; each modal governs the form named by its `governs` key, so the main verb
 * surfaces as a dictionary form under 〜ことができる / 〜必要がある and as a polite stem
 * under 〜たい. A governed modal contributes its own bare `suffix_dict` / `suffix_stem`,
 * which is what lets them chain: 行くことができたいです.
 */
function modalSegs(
  modals: ConceptForms[],
  verb: ConceptForms,
  tense: Tense,
  negative: boolean,
  index = 0,
  form?: JaForm,
): RubySegment[] {
  if (index === modals.length) return [verbFormSeg(verb, form ?? 'dict')];
  const m = modals[index];
  const governed = (m.forms['governs'] as JaForm | undefined) ?? 'dict';
  const inner = modalSegs(modals, verb, tense, negative, index + 1, governed);
  // No `form` means this is the outermost modal: it takes the finite, inflected ending.
  return form === undefined
    ? [...inner, ...modalEndingSegs(m, tense, negative)]
    : [...inner, modalSuffixSeg(m, form)];
}

/**
 * The verb segment(s) for a non-neutral aspect, built on the te-form (`forms['te']`):
 *   progressive → ～ています ("行っています", past ～ていました)
 *   resultative → ～てしまいます (completion; "行ってしまいました")
 *   prospective → dictionary form + ところです ("行くところです", past ～ところでした)
 * Future reuses the present, as elsewhere in the Japanese engine.
 */
function aspectVerbSegs(verbPhrase: ResolvedVerbPhrase): RubySegment[] {
  const { verb, negative, tense = 'present', aspect = 'neutral' } = verbPhrase;
  const past = tense === 'past';
  if (aspect === 'prospective') {
    const cop = past ? 'でした' : 'です';
    return [wordSeg(verb.forms['base'] ?? '', verb.forms['reading']), { t: 'ところ' }, { t: cop }];
  }
  // Progressive (～ている) and resultative (～てしまう) both build on the te-form.
  const te = verb.forms['te'];
  const teSeg = te ? wordSeg(te, verb.forms['te_reading']) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const stem = aspect === 'resultative' ? 'しまい' : 'い'; // てしまう vs ている (polite い-stem)
  const suffix = negative
    ? (past ? `${stem}ませんでした` : `${stem}ません`)
    : (past ? `${stem}ました` : `${stem}ます`);
  return [teSeg, { t: suffix }];
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
  const { verb, negative, modifier, tense = 'present', aspect = 'neutral', modals } = verbPhrase;
  const segs: RubySegment[] = [];
  segs.push(...complementSegs(complements));
  if (indirectObject) segs.push(...npSegs(indirectObject), { t: 'に' });
  if (directObject) segs.push(...npSegs(directObject), { t: 'を' });
  if (modifier) {
    const base = modifier.forms['base'] ?? '';
    if (base) segs.push(wordSeg(base, modifier.forms['reading']));
  }
  // A modal suffixes the verb and takes the tense/polarity itself; aspect has no
  // periphrasis to compose with here, so it is dropped (see the Modality note above).
  if (modals.length > 0) segs.push(...modalSegs(modals, verb, tense, negative === true));
  else if (aspect === 'neutral') segs.push(verbSeg(verb, negative, tense));
  else segs.push(...aspectVerbSegs(verbPhrase));
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
  terminator: '。',
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
