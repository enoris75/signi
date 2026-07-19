import { COMPLEMENT_RENDER_ORDER, type CauseSentiment, type ComplementType, type CoordConjunction, type Definiteness, type Degree, type PathSpecifier, type Tense } from '@signi/shared';
import { abstractionLevel, adjDegree, causeSentiment, firstConjunct, groupHasNegativeAdverb, isGenericSubject, isPronominalPossessor, mannerRelation, pathSpecifier, type ConceptForms, type ResolvedComplement, type ResolvedNounElement, type ResolvedNounPhrase, type ResolvedVerbPhrase, type RubySegment, type LanguageEngine, type ResolvedPhrase } from '../types.js';
import { possessiveJa } from '../possessive.js';

// Prenominal degree adverb (もっと大きい "bigger", 最も大きい "biggest"). Japanese comparison
// is largely contextual (より marks the standard); these adverbs are the closest MVP. The two
// LOWERED degrees are negative-polarity: Japanese lowers a degree by negating the adjective, so
// 'less' pairs それほど with the negative (それほど大きくない "not so big") and 'least' pairs 最も with
// it (最も大きくない "least big") — see `jaComparisonAdj`. Reusing 最も for 'least' bare would make it
// identical to 'most', and あまり on an affirmative adjective is ungrammatical.
const JA_DEGREE: Record<Degree, string> = {
  positive: '', more: 'もっと', most: '最も', less: 'それほど', least: '最も', equally: '同じくらい',
};

/** True for the lowered degrees, which Japanese realises by negating the adjective. */
function isLoweredDegree(concept: ConceptForms): boolean {
  const d = adjDegree(concept);
  return d === 'less' || d === 'least';
}

/**
 * An adjective's surface for its degree. The lowered degrees (less/least) put the adjective into
 * its plain negative — i-adjective 大きい → 大きくない, na-adjective 幸せな → 幸せではない — because a
 * lowered degree is negative-polarity in Japanese. The result itself ends in …ない (an
 * i-adjective), so every downstream position (attributive 大きくない, adverbial 大きくなく, copula
 * 大きくないです) is handled by the ordinary い-adjective machinery. Every other degree keeps the
 * stored base. Furigana tracks the same substitution (whole-word ruby, as elsewhere).
 */
function jaComparisonAdj(concept: ConceptForms): { base: string; reading?: string } {
  const base = concept.forms['base'] ?? '';
  const reading = concept.forms['reading'];
  if (concept.forms['role'] !== 'adjective' || !isLoweredDegree(concept)) return { base, reading };
  const negate = (s: string): string =>
    s.endsWith('な') ? `${s.slice(0, -1)}ではない`
    : s.endsWith('い') ? `${s.slice(0, -1)}くない`
    : `${s}ではない`;
  return { base: negate(base), reading: reading ? negate(reading) : reading };
}

/** Fold katakana to hiragana, so a kana word compares equal however it is written. */
function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/**
 * A segment for one word: attach the furigana reading only when it differs from the surface. The
 * comparison folds katakana to hiragana first, so a katakana word (ネズミ) seeded with a redundant
 * hiragana reading (ねずみ) is recognised as the same word and takes no ruby — Japanese never
 * furiganas katakana. A kanji surface never folds to its all-kana reading, so it keeps its ruby.
 */
function wordSeg(surface: string, reading?: string): RubySegment {
  return reading && toHiragana(reading) !== toHiragana(surface) ? { t: surface, r: reading } : { t: surface };
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
  // Instrumental (means / tool) — で, the same particle the locative takes: Japanese marks
  // "with a word" (言葉で) and "at the house" (家で) alike, and only the verb tells them apart.
  instrumental: 'で',
  // Manner adverbial (complemento di modo) — で, the same means/locative particle: "at the speed
  // of light" is 光の速さで, "with care" 注意で. で serves every manner specifier; the possessor
  // (光の) renders through the shared noun-phrase path.
  manner: 'で',
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
 * Segments for a noun phrase: [relative clause] [adjectives] noun. Japanese does not put
 * spaces between words, so stacked adjectives run straight into each other and into the head
 * ("大きい小さい猫"); each one's own attributive marker (な / の) is what keeps them apart.
 * Any relative clause is prepended (see below).
 */
function npSegs(np: ResolvedNounPhrase): RubySegment[] {
  const core: RubySegment[] = [];
  // A possessor is prenominal, marked by の ("猫の本"); recursing handles its own
  // adjectives / nested possessor / relative clause ("子供の猫の本"). A pronominal possessor
  // ("彼の犬") is the antecedent pronoun + の, invariant of the possessed head.
  if (np.possessor) {
    core.push(
      ...(isPronominalPossessor(np.possessor)
        ? possessiveJa(np.possessor)
        : [...npSegs(np.possessor), { t: 'の' }]),
    );
  }
  // Attributive nouns ("sail boat") are also の-linked in Japanese (ガラスのコップ); the
  // relation is neutralised, so every relation renders the same の. The modifier's own
  // adjectives are bare (Japanese adjectives don't agree) and precede it (意味的なフレーズ
  // の創造者 = "semantic phrase creator").
  for (const m of np.nounModifiers) {
    const base = m.concept.forms['base'];
    if (!base) continue;
    for (const a of m.adjectives) {
      const ab = a.forms['base'] ?? '';
      if (ab) core.push(wordSeg(ab, a.forms['reading']));
    }
    core.push(wordSeg(base, m.concept.forms['reading']), { t: 'の' });
  }
  const adjSegs: RubySegment[] = [];
  for (const a of np.adjectives) {
    // The lowered degrees negate the adjective (大きい → 大きくない); every other keeps the base.
    const { base, reading } = jaComparisonAdj(a);
    if (!base) continue;
    // Prenominal degree adverb bound directly to its adjective (もっと大きい), no space.
    const deg = JA_DEGREE[adjDegree(a)];
    if (deg) adjSegs.push({ t: deg });
    adjSegs.push(wordSeg(base, reading));
  }
  core.push(...adjSegs);
  const head = np.head.forms;
  core.push(wordSeg(head['base'] ?? '', head['reading']));
  // A relative clause is prenominal in Japanese: the whole predicate precedes the head
  // noun with no relative pronoun (泣いた少年 = "the boy who cried"). For a non-subject
  // (e.g. object) relative the clause's own subject leads, marked by が (私が読む本 = "the
  // book I read"); the gap slot is already absent from the clause. The clause verb takes
  // the *plain* form (食べた猫 "the cat that ate…"), not the polite ます/ました of a main
  // clause — Japanese requires plain form on a prenominal predicate (see plainVerbSeg), so the
  // predicate is built with `plain` set.
  const rel = np.relative;
  if (!rel) return core;
  // A generic ("one") subject is dropped, leaving the bare prenominal clause (食べる物 "a thing one
  // eats"); a specific non-subject relative leads with its own subject marked by が (私が読む本).
  const clauseSubjectSegs: RubySegment[] =
    rel.headRole !== 'subject' && rel.subject && !isGenericSubject(rel.subject)
      ? [...elSegs(rel.subject), { t: 'が' }] : [];
  return [...clauseSubjectSegs, ...predicateSegs(rel.verbPhrase, rel.directObject, rel.complements, undefined, true), ...core];
}

/**
 * The polite stem of a verb (行きます → 行き) with its reading, or null when the lexeme
 * carries no ます form. Everything polite — the tense endings, the modal suffixes — is
 * built by appending to this.
 */
/**
 * A whole noun slot: its conjuncts strung together the Japanese way. Japanese repeats the
 * conjunction between *every* pair and writes no comma — 猫と犬と狐 — where the European
 * languages comma all but the last ("the cat, the dog and the fox"). と is the exhaustive "and";
 * か the disjunctive "or".
 *
 * The case particle (は / を / に) is NOT emitted here: it attaches once, to the group as a
 * whole (「猫と犬は」, not 「猫はと犬は」), so every caller appends it after these segments —
 * which is exactly what they already did for a single phrase.
 */
function elSegs(el: ResolvedNounElement): RubySegment[] {
  const word = el.conjunction === 'or' ? 'か' : 'と';
  const segs: RubySegment[] = [];
  el.conjuncts.forEach((np, i) => {
    if (i > 0) segs.push({ t: word });
    segs.push(...npSegs(np));
  });
  return segs;
}

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
 * under 〜たい. A governed verb-kind modal contributes its own bare `suffix_dict` /
 * `suffix_stem`, which is what lets two of them stack directly (行くことができる必要があります).
 * The volitional 〜たい cannot stack that way, so it is bridged (ようになる / と思う) — see the two
 * i-adjective cases below.
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
  const isIadj = m.forms['kind'] === 'iadj';
  const innerModal = index + 1 < modals.length ? modals[index + 1] : undefined;
  const innerIsIadj = innerModal?.forms['kind'] === 'iadj';
  // 〜たい (volition, an i-adjective) does not chain by naive suffix-gluing: attaching it to a
  // nominalising modal's stem gives できたい, and letting one nominalise it gives たいこと — both
  // ungrammatical. So it is bridged instead.
  //
  // Case A — 〜たい *over* a verb-kind modal (want to be able to …): the inner modal rides
  // ようになる ("come to be able"), and 〜たい inflects なる (its polite stem なり + たい):
  // 食べることができるようになりたいです.
  if (isIadj && innerModal && !innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, 'dict');
    return form === undefined
      ? [...inner, { t: 'ように' }, { t: 'なり' }, ...modalEndingSegs(m, tense, negative)]
      : [...inner, { t: 'ように' }, { t: form === 'stem' ? 'なり' : 'なる' }];
  }
  // Case B — a nominalising verb-kind modal *over* 〜たい (… can want to eat): the desire is made
  // a clause with と思う ("think that …") before the modal nominalises it: 食べたいと思うことができます.
  if (!isIadj && innerIsIadj) {
    const inner = modalSegs(modals, verb, tense, negative, index + 1, governed);
    const bridge: RubySegment[] = [{ t: 'と' }, wordSeg('思う', 'おもう')];
    return form === undefined
      ? [...inner, ...bridge, ...modalEndingSegs(m, tense, negative)]
      : [...inner, ...bridge, modalSuffixSeg(m, form)];
  }
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
function aspectVerbSegs(verbPhrase: ResolvedVerbPhrase, negative: boolean): RubySegment[] {
  const { verb, tense = 'present', aspect = 'neutral' } = verbPhrase;
  const past = tense === 'past';
  if (aspect === 'prospective') {
    // The copula carries the polarity: affirmative です/でした, negative ではありません(でした) —
    // the same copula negation the na-adjective/noun predicate uses. Without this the prospective
    // renders identically for both polarities.
    const cop = negative
      ? (past ? 'ではありませんでした' : 'ではありません')
      : (past ? 'でした' : 'です');
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

/**
 * The plain (dictionary / plain-past) form of a verb, for a subordinate predicate. A prenominal
 * relative clause takes the plain form, not the polite ます/ました of a main clause (食べる猫 /
 * 食べた猫, never 食べます猫). Non-past is the dictionary form; the past is the plain past (た-form),
 * derived from the te-form exactly as taraSeg builds its stem (て→た, で→だ). Falls back to the
 * dictionary form when no te-form is stored. Negation and aspect are NOT plain-formed here — they
 * still route through the polite verbSeg / aspectVerbSegs, a documented remaining gap (see the
 * negative and aspectual relative-clause tests, which lock the current polite output).
 */
function plainVerbSeg(verb: ConceptForms, tense: Tense): RubySegment {
  const base = verb.forms['base'] ?? '';
  const reading = verb.forms['reading'];
  if (tense !== 'past') return wordSeg(base, reading); // dictionary form (present / future)
  const te = verb.forms['te'];
  if (!te) return wordSeg(base, reading);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(toTa(te), teReading ? toTa(teReading) : undefined);
}

/**
 * The ～たら conditional form of a verb (the protasis of a hypothetical: 食べたら "if … eats").
 * Built on the te-form: the plain past is te with て→た / で→だ, then ～ら. Falls back to the
 * dictionary form + たら when no te-form is stored.
 */
function taraSeg(verb: ConceptForms): RubySegment {
  const te = verb.forms['te'];
  if (!te) return wordSeg(`${verb.forms['base'] ?? ''}たら`, undefined);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(`${toTa(te)}ら`, teReading ? `${toTa(teReading)}ら` : undefined);
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
      if (takesNi) segs.push({ t: 'に' });
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
        segs.push(...elSegs(c.phrase), { t: 'を' });
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
    if (type === 'route') {
      const spec = pathSpecifier(c);
      if (REL_NOUN[spec]) segs.push(wordSeg(REL_NOUN[spec], REL_NOUN_READING[spec]));
    }
    // Manner: a similative head takes 〜のように ("風のように" = like the wind), not the で the
    // means/measure/mode relations share; every other complement uses its fixed particle.
    const particle =
      type === 'cause' ? CAUSE_PARTICLE[causeSentiment(c)]
      : type === 'manner' && mannerRelation(firstConjunct(c.phrase).head.forms) === 'similative' ? 'のように'
      : PARTICLE[type];
    segs.push({ t: particle });
  }
  return segs;
}

/**
 * The copula (BE) predicate: the predicate adjective or noun with an inflected です — the
 * plain "is careful" (慎重です) that the になる-based predicative can't express. An i-adjective
 * inflects itself (楽しいです / 楽しくなかったです); a na-adjective (strip the attributive な) or a
 * noun takes the copula proper (慎重です / 慎重ではありませんでした). Future reuses the present.
 */
function copulaSegs(pred: ResolvedComplement, tense: Tense, negative: boolean): RubySegment[] {
  // The inflected copula agrees with one head; a coordinated copular predicate takes the first
  // conjunct's form (a documented approximation — the UI's copula predicate is a single phrase).
  const head = firstConjunct(pred.phrase);
  const f = head.head.forms;
  const past = tense === 'past';
  const isAdj = f['role'] === 'adjective';
  // The lowered degrees negate the adjective (大きい → 大きくない, itself an い-adjective, so the
  // い-branch below inflects its copula: 大きくないです).
  const { base, reading } = isAdj ? jaComparisonAdj(head.head) : { base: f['base'] ?? '', reading: f['reading'] };
  // The predicate adjective's degree adverb leads, as it does attributively (もっと楽しいです).
  const deg = isAdj ? JA_DEGREE[adjDegree(head.head)] : '';
  const degSegs: RubySegment[] = deg ? [{ t: deg }] : [];
  if (isAdj && base.endsWith('い')) {
    const ending = negative
      ? (past ? 'くなかったです' : 'くないです')
      : (past ? 'かったです' : 'いです');
    return [
      ...degSegs,
      wordSeg(base.slice(0, -1), reading?.endsWith('い') ? reading.slice(0, -1) : reading),
      { t: ending },
    ];
  }
  const cop = negative
    ? (past ? 'ではありませんでした' : 'ではありません')
    : (past ? 'でした' : 'です');
  // na-adjective: strip the attributive な, then the copula. A noun predicate is a full NP
  // (its own adjectives/possessor) rendered by npSegs, then the copula.
  if (isAdj && base.endsWith('な')) {
    return [
      ...degSegs,
      wordSeg(base.slice(0, -1), reading?.endsWith('な') ? reading.slice(0, -1) : reading),
      { t: cop },
    ];
  }
  return [...elSegs(pred.phrase), { t: cop }];
}

type JaIPN = '2sg' | '1pl' | '2pl';

/** Imperative person key from a subject: 1st-plural cohortative, else 2nd person. */
function jaImperativePN(forms: Record<string, string>): JaIPN {
  const person = forms['person'] ?? '2';
  const plural = (forms['number'] ?? 'singular') === 'plural';
  return person === '1' ? '1pl' : plural ? '2pl' : '2sg';
}

/**
 * The imperative verb segment(s). The 1st-plural is the cohortative ～ましょう ("let's eat",
 * 食べましょう) off the masu-stem. The 2nd person is the polite request ～てください (食べてください)
 * built on the te-form; its negative uses the plain prohibitive ～な (走るな) — a deliberate
 * register gap (the affirmative stays polite), taken because the polite ～ないでください would need a
 * nai-form the lexicon doesn't store.
 *
 * An `instruction` (a button, a menu entry, a recipe step) is addressed to nobody, and Japanese
 * does not command there: it labels with the verb's verbal noun — 保存, 読み込み, 追加 — so
 * "文を読み込んでください" ("please load a period") becomes "文を読み込み". The noun is the `label`
 * form seeded on the ja verb; failing that it derives from the masu-stem, minus the し a
 * する-verb ends on (保存し → 保存). Its negative is the prohibitive ～ないこと ("走らないこと"),
 * which the lexicon's nai-form gap likewise rules out, so a negative instruction keeps ～な.
 */
function jaImperativeSegs(verb: ConceptForms, pn: JaIPN, negative: boolean, instruction = false): RubySegment[] {
  if (instruction && !negative) {
    const label = verb.forms['label'];
    if (label) return [wordSeg(label)];
    const st = masuStem(verb);
    if (st) return [wordSeg(st.stem.replace(/し$/, ''), st.reading?.replace(/し$/, ''))];
  }
  if (pn === '1pl') {
    if (negative) {
      // "let's not eat" → 食べるのはやめましょう ("let's refrain from eating"). The hortative ～ましょう
      // rides やめる ("stop"), so the negation is not dropped; built on the dictionary form, it
      // sidesteps the nai-form the lexicon doesn't store.
      const base = verb.forms['base'] ?? '';
      return [wordSeg(base, verb.forms['reading']), { t: 'のはやめましょう' }];
    }
    const st = masuStem(verb);
    if (st) return [wordSeg(st.stem + 'ましょう', st.reading !== undefined ? st.reading + 'ましょう' : undefined)];
    return [wordSeg((verb.forms['masu_present'] ?? verb.forms['base'] ?? '').replace(/ます$/, '') + 'ましょう')];
  }
  if (negative) {
    const base = verb.forms['base'] ?? '';
    return [wordSeg(base + 'な', verb.forms['reading'] ? verb.forms['reading'] + 'な' : undefined)];
  }
  const te = verb.forms['te'];
  const teSeg = te ? wordSeg(te, verb.forms['te_reading']) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  return [teSeg, { t: 'ください' }];
}

/**
 * The predicate half of a phrase, in Japanese order: complements (the recipient's に among
 * them) DirectObj+を Adv V. Shared by the main sentence (after 〜は) and by prenominal
 * relative clauses.
 * `imperativePN` is set only for a top-level command (relative clauses are never imperative).
 * `plain` is set only for a subordinate (prenominal relative) predicate: its finite verb takes
 * the plain form instead of the polite ます (see plainVerbSeg).
 */
function predicateSegs(
  verbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounElement | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  imperativePN?: JaIPN,
  plain = false,
): RubySegment[] {
  const { verb, negative, modifier, tense = 'present', aspect = 'neutral', mood, register, modals } = verbPhrase;
  const segs: RubySegment[] = [];
  // A negative-polarity adverb (決して "never", めったに "rarely") grammatically demands a
  // negated predicate — 決して…ない — so it forces the predicate negative even when the verb
  // phrase itself isn't marked negative. The adverb is still emitted; only the ending flips.
  // A negative-polarity adverb anywhere in the group — the main verb's or any modal's — forces
  // the negated predicate (決して…ない).
  const negated = negative === true || groupHasNegativeAdverb(verbPhrase);
  // The copula (BE) has no verb of its own — the predicate carries the inflected です. It is
  // intransitive and licenses only the predicative, so no objects or other complements occur;
  // an adverb (いつも) simply precedes the predicate.
  const predicative = complements?.['predicative'];
  // Imperative: a subjectless command (SOV — objects/complements first, verb last). The copula
  // command routes through する: "…にしてください" / "…にしないでください" (する's nai-form is fixed, so
  // the copula negative *can* stay polite, unlike ordinary verbs).
  if (mood === 'imperative') {
    const pn = imperativePN ?? '2sg';
    if (verb.forms['copula'] === '1' && predicative) {
      segs.push(...complementSegs({ predicative }), { t: negated ? 'しないでください' : 'してください' });
      return segs;
    }
    segs.push(...complementSegs(complements));
    if (directObject) segs.push(...elSegs(directObject), { t: 'を' });
    if (modifier) {
      const b = modifier.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, modifier.forms['reading']));
    }
    segs.push(...jaImperativeSegs(verb, pn, negated, register === 'instruction'));
    return segs;
  }
  // Infinitive / citation phrase: the plain dictionary form (SOV, subject-less) — 「食物を消費する」.
  // This is the true citation, distinct from the imperative `instruction` register above, which
  // Japanese renders as the verbal noun (消費). A copula predicate falls through to the です block
  // (a copula citation won't arise for a verb definition). The plain negative needs a nai-form the
  // lexicon doesn't store, so a negative citation falls back to the polite verbSeg — a documented gap.
  if (mood === 'infinitive' && !(verb.forms['copula'] === '1' && predicative)) {
    segs.push(...complementSegs(complements));
    if (directObject) segs.push(...elSegs(directObject), { t: 'を' });
    if (modifier) {
      const b = modifier.forms['base'] ?? '';
      if (b) segs.push(wordSeg(b, modifier.forms['reading']));
    }
    segs.push(negated ? verbSeg(verb, true, 'present') : plainVerbSeg(verb, 'present'));
    return segs;
  }
  if (verb.forms['copula'] === '1' && predicative) {
    if (modifier) {
      const base = modifier.forms['base'] ?? '';
      if (base) segs.push(wordSeg(base, modifier.forms['reading']));
    }
    // A copula has no verb to carry aspect; the only meaningful one is the resultative
    // ("has been X"), a past state — rendered as the past copula (美しくなかった). Progressive /
    // prospective on a copula stay best-effort present. (Aspect on a copula is marginal.)
    const copTense = tense === 'past' || aspect === 'resultative' ? 'past' : tense;
    segs.push(...copulaSegs(predicative, copTense, negated));
    return segs;
  }
  segs.push(...complementSegs(complements));
  if (directObject) segs.push(...elSegs(directObject), { t: 'を' });
  // Adverbs precede the predicate (SOV). Each modal's adverb stacks in scope order (outermost
  // first), with the main verb's adverb nearest the verb — 決して いつも 行きたくない.
  for (const m of modals) {
    const b = m.modifier?.forms['base'] ?? '';
    if (b) segs.push(wordSeg(b, m.modifier!.forms['reading']));
  }
  if (modifier) {
    const base = modifier.forms['base'] ?? '';
    if (base) segs.push(wordSeg(base, modifier.forms['reading']));
  }
  // Hypothetical conditional: the "if" clause (subjunctive) takes the ～たら form. The main
  // clause (conditional) falls through to the ordinary polite main-clause path — Japanese has
  // no dedicated conditional inflection, and keeping the normal path preserves tense and,
  // crucially, negation (走りません). The たら protasis carries the hypothetical meaning.
  if (mood === 'subjunctive') segs.push(taraSeg(verb));
  // A modal suffixes the verb and takes the tense/polarity itself; aspect has no
  // periphrasis to compose with here, so it is dropped (see the Modality note above).
  else if (modals.length > 0) segs.push(...modalSegs(modals.map((m) => m.verb), verb, tense, negated));
  // A prenominal relative clause takes the plain form on its finite verb (食べる猫 / 食べた猫).
  // Negation still routes through the polite verbSeg — the plain negative (ない/なかった) needs a
  // nai-form the lexicon doesn't store — a documented remaining gap.
  else if (aspect === 'neutral') {
    segs.push(plain && !negated ? plainVerbSeg(verb, tense) : verbSeg(verb, negated, tense));
  }
  else segs.push(...aspectVerbSegs(verbPhrase, negated));
  return segs;
}

/**
 * Japanese word order: S 〈complements, recipient に〉 DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
/** Whether a resolved noun slot is a single adjective-definition gloss phrase (see NounPhrase.dimensionGloss). */
function isDimensionGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].dimensionGloss === true;
}

/**
 * An adjective-definition gloss fragment ("大きさが大きい" — of great size): the dimension noun
 * (the head) marked with が, then its degree adjective in plain form (an い-adjective stays 大きい;
 * a na-adjective drops the attributive な). Japanese has no adposition here — the が-predicate is
 * the natural gloss — so, unlike the other engines, it does not read the `dimensionRelation`.
 */
function dimensionGlossSegs(np: ResolvedNounPhrase): RubySegment[] {
  const nounSeg = wordSeg(np.head.forms['base'] ?? '', np.head.forms['reading']);
  const adj = np.adjectives[0];
  if (!adj) return [nounSeg];
  const { base, reading } = jaComparisonAdj(adj);
  const na = base.endsWith('な');
  const adjSeg = wordSeg(na ? base.slice(0, -1) : base, na && reading?.endsWith('な') ? reading.slice(0, -1) : reading);
  const deg = JA_DEGREE[adjDegree(adj)];
  const degSegs: RubySegment[] = deg ? [{ t: deg }] : [];
  return [nounSeg, { t: 'が' }, ...degSegs, adjSeg];
}

/** Whether a resolved noun slot is a single manner-definition gloss phrase (see NounPhrase.mannerGloss). */
function isMannerGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].mannerGloss === true;
}

/**
 * A manner-definition gloss fragment ("高い速さで" — at high speed): the manner noun phrase (its
 * degree adjective attributive, its determiner placed by the ordinary NP path) closed by the manner
 * particle — the で the means/measure/mode relations share, or 〜のように for a similative head, exactly
 * as a `manner` complement closes. Unlike the が-predicate dimension gloss, this is an adverbial.
 */
function mannerGlossSegs(el: ResolvedNounElement): RubySegment[] {
  const particle = mannerRelation(firstConjunct(el).head.forms) === 'similative' ? 'のように' : 'で';
  return [...elSegs(el), { t: particle }];
}

function buildClauseSegments(phrase: ResolvedPhrase, subjectParticle: string): RubySegment[] {
  // A verbless period marked as an adjective-definition gloss is a が-predicate ("大きさが大きい"),
  // not a bare noun-phrase title — render the dimension noun + が + its degree adjective.
  if (!phrase.verbPhrase && isDimensionGloss(phrase.subject)) return dimensionGlossSegs(firstConjunct(phrase.subject));
  // A manner-definition gloss ("高い速さで") is the adverbial fragment defining an adverb.
  if (!phrase.verbPhrase && isMannerGloss(phrase.subject)) return mannerGlossSegs(phrase.subject);
  // Verbless period: a bare noun phrase (a title like "最新ニュース") — no topic は, no predicate.
  if (!phrase.verbPhrase) return elSegs(phrase.subject);
  const segs: RubySegment[] = [];
  // An imperative drops its subject/topic; the subject's person still selects the form. An
  // infinitive citation (「食物を消費する」) is likewise subject-less on the surface.
  const imperative = phrase.verbPhrase.mood === 'imperative';
  const dropsSubject = imperative || phrase.verbPhrase.mood === 'infinitive';
  // One topic particle for the whole subject, coordinated or not: 「ピーターとパウロは」.
  if (!dropsSubject) segs.push(...elSegs(phrase.subject), { t: subjectParticle });
  const impPN = imperative ? jaImperativePN(phrase.subject.agreement) : undefined;
  segs.push(...predicateSegs(phrase.verbPhrase, phrase.directObject, phrase.complements, impPN));
  return segs;
}

// Coordinating conjunctions as Japanese connective adverbs, placed after the first clause's 、.
const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'そして',
  or: 'または',
  but: 'しかし',
  that_is: 'つまり',
  therefore: 'だから',
  then: 'それから',
};

function buildSegments(phrase: ResolvedPhrase): RubySegment[] {
  const main = buildClauseSegments(phrase, 'は');
  // Hypothetical conditional: もし <protasis (…たら)>、 <apodosis (…でしょう)>. The condition
  // clause's subject takes が (the neutral subject marker inside a subordinate clause).
  const sentence = phrase.condition
    ? [{ t: 'もし' }, ...buildClauseSegments(phrase.condition, 'が'), { t: '、' }, ...main]
    : main;
  // Coordination: <first clause>、<conjunction> <second clause>.
  if (!phrase.coordination) return sentence;
  return [
    ...sentence,
    { t: '、' },
    { t: COORD_WORDS[phrase.coordination.conjunction] },
    ...buildClauseSegments(phrase.coordination.clause, 'は'),
  ];
}

/**
 * The Japanese determiner words, for the UI's determiner menu only (see renderDeterminer). The
 * article values are absent: Japanese has no article to name, which is exactly what the menu's
 * em-dash says.
 */
const JA_DETERMINERS: Partial<Record<Definiteness, string>> = {
  this: 'この',
  that: 'その',
  some: 'いくつかの',
  no: 'どの…もない',
  many: '多くの',
  few: '少しの',
  all: 'すべての',
};

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
  // A na-/no-adjective is seeded in its attributive form (慎重な, 単数の), where the marker links
  // it to the noun that follows. A word standing alone has no noun to link to, so the marker
  // goes — the same trim copulaSegs makes for a predicate adjective. An i-adjective keeps its
  // い, which is part of the word (若い).
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return /[なの]$/.test(base) ? base.slice(0, -1) : base;
  },
  // Japanese writes no spaces: the words of a label run together (第二単数).
  wordJoiner: '',
  /**
   * The determiner alone, for the menu that picks one. Japanese spells no article at all —
   * identifiability is left to context — so the three article values render nothing and the menu
   * shows an em-dash for them; the demonstratives and the quantifiers are real words (the の
   * linking them to their noun is part of the attributive form, so it is kept). Nothing here
   * reaches sentence rendering: the ja engine still drops every determiner from a noun phrase.
   */
  renderDeterminer(noun: ConceptForms): string {
    return JA_DETERMINERS[(noun.forms['definiteness'] ?? 'definite') as Definiteness] ?? '';
  },
};
