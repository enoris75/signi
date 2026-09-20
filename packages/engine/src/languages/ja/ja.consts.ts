import type { CauseSentiment, ComplementType, CoordConjunction, Definiteness, Degree, PathSpecifier } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../../types.js';

// Prenominal degree adverb (もっと大きい "bigger", 最も大きい "biggest"). Japanese comparison
// is largely contextual (より marks the standard); these adverbs are the closest MVP. The two
// LOWERED degrees are negative-polarity: Japanese lowers a degree by negating the adjective, so
// 'less' pairs それほど with the negative (それほど大きくない "not so big") and 'least' pairs 最も with
// it (最も大きくない "least big") — see `jaComparisonAdj`. Reusing 最も for 'least' bare would make it
// identical to 'most', and あまり on an affirmative adjective is ungrammatical.
export const JA_DEGREE: Record<Degree, string> = {
  positive: '', more: 'もっと', most: '最も', less: 'それほど', least: '最も', equally: '同じくらい',
};

/** Postposition particle per complement type. (Route を is safe: motion verbs are intransitive.) */
export const PARTICLE: Record<ComplementType, string> = {
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
export const CAUSE_PARTICLE: Record<CauseSentiment, string> = {
  neutral: 'のために',
  negative: 'のせいで',
  positive: 'のおかげで',
};

/**
 * Spatial relations expressed via a relational noun before the complement's particle — "橋の下を"
 * (route: under the bridge) and "ベッドの下に" (locative: under the bed). Japanese builds both the
 * same way, from the same noun; only the particle that follows differs (を for a traversed path,
 * に for a place), which is why route and locative share this map. The neutral relations add no
 * noun: a bare route is 市場を, a bare locative 家に.
 */
export const REL_NOUN: Record<PathSpecifier, string> = {
  in: '',
  through: '',
  under: 'の下',
  over: 'の上',
  around: 'の周り',
  behind: 'の後ろ',
  in_front_of: 'の前',
};

/** Readings for the relational nouns above (word-level furigana over the の+kanji run). */
export const REL_NOUN_READING: Record<PathSpecifier, string> = {
  in: '',
  through: '',
  under: 'のした',
  over: 'のうえ',
  around: 'のまわり',
  behind: 'のうしろ',
  in_front_of: 'のまえ',
};

// Coordinating conjunctions as Japanese connective adverbs, placed after the first clause's 、.
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'そして',
  or: 'または',
  but: 'しかし',
  that_is: 'つまり',
  therefore: 'だから',
  then: 'それから',
};

/**
 * Prenominal determiner words that render in a *sentence* (unlike the articles, which spell
 * nothing in Japanese). The demonstratives and quantifiers are real attributive words — their
 * linking の is part of the value, so they need no extra particle and simply lead the noun phrase
 * (すべての時間 = "all times"). The `no` quantifier is absent here: it is a circumfix, not a plain
 * prenominal word, and is handled by JA_NEGATIVE_DETERMINER.
 */
export const JA_PRENOMINAL_DET: Partial<Record<Definiteness, string>> = {
  this: 'この',
  that: 'その',
  some: 'いくつかの',
  many: '多くの',
  few: '少しの',
  all: 'すべての',
};

/**
 * The `no` quantifier is a circumfix (どの … も … ない), split across three owners: the noun phrase
 * contributes the prenominal `pre` (どの); whoever places the group's case particle closes it with
 * `post` (も), which replaces が / を / は and follows any other particle (see `jaParticleSegs`); and the
 * predicate contributes the clause-final ない (predicateSegs's negation or, for a verbless gloss,
 * mannerGlossSegs).
 */
export const JA_NEGATIVE_DETERMINER = { pre: 'どの', post: 'も' } as const;

/**
 * The Japanese determiner words, for the UI's determiner menu only (see renderDeterminer). The
 * article values are absent: Japanese has no article to name, which is exactly what the menu's
 * em-dash says.
 */
export const JA_DETERMINERS: Partial<Record<Definiteness, string>> = {
  this: 'この',
  that: 'その',
  some: 'いくつかの',
  no: 'どの…もない',
  many: '多くの',
  few: '少しの',
  all: 'すべての',
};

/**
 * The existential verbs a located subject takes in place of the copula: いる for an animate subject,
 * ある for an inanimate one (猫は家にいます, 本は家にあります). Written in kana, so they carry no
 * reading. The te-form drives the command (いてください), the past (いた) and たら (いたら); the nai-form
 * the negative たら (いなかったら, なかったら).
 */
// The pro-form that stands for a subject complement, as a predicate noun for the copula: そうです,
// そうではありません. Japanese cannot leave a predicate nominal unspoken, so そう fills it where the
// complement is elided (A121: 犬はそうではありません) and where a relative's head is the complement
// (A123: 犬がそうではない伝説).
export const JA_SOU: ResolvedComplement = {
  phrase: { conjuncts: [{ head: { conceptId: 'SOU', forms: { base: 'そう' } }, adjectives: [], nounModifiers: [] }], agreement: {} },
};
export const JA_IRU: ConceptForms = { conceptId: 'IRU', forms: { base: 'いる', masu_present: 'います', te: 'いて', nai: 'いない' } };
export const JA_ARU: ConceptForms = { conceptId: 'ARU', forms: { base: 'ある', masu_present: 'あります', te: 'あって', nai: 'ない' } };

/**
 * The light verb the causative construction closes on: 〜ようにする, "to bring it about that —"
 * (人が物体を見るようにする). Japanese realises a causative as a construction, not as a transitive verb
 * governing a clause, so a `causative` lexeme's own word — 引き起こす, which is what it says standing
 * alone — gives way to this one when it governs an object-controlled infinitive complement, exactly
 * as the copula gives way to ある / いる when it states that its subject exists. Kana, so no reading.
 */
export const JA_SURU: ConceptForms = { conceptId: 'SURU', forms: { base: 'する', masu_present: 'します', te: 'して', nai: 'しない' } };
