import type { CauseSentiment, ComplementType, CoordConjunction, Definiteness, Degree, PathSpecifier, TemporalRelation } from '@signi/shared';
import type { ConceptForms, ResolvedComplement } from '../../types.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Prenominal degree adverb (もっと大きい "bigger", 最も大きい "biggest"). Japanese comparison
// is largely contextual (より marks the standard); these adverbs are the closest MVP. The two
// LOWERED degrees are negative-polarity: Japanese lowers a degree by negating the adjective, so
// 'less' pairs それほど with the negative (それほど大きくない "not so big") and 'least' pairs 最も with
// it (最も大きくない "least big") — see `jaComparisonAdj`. Reusing 最も for 'least' bare would make it
// identical to 'most', and あまり on an affirmative adjective is ungrammatical.
// With a standard of comparison the standard takes the adverb's place (see `JA_STANDARD`), and the
// polarity carries over: 'less' is then 犬ほど + the same negated adjective (犬ほど大きくない "not as big
// as the dog"), ほど being exactly the それほど this table writes bare — "to that extent" becomes "to
// the dog's extent" (P09-E5).
export const JA_DEGREE: Record<Degree, string> = {
  positive: '', more: 'もっと', most: '最も', less: 'それほど', least: '最も', equally: '同じくらい',
};

/**
 * The particle after a standard of comparison, by degree (P09-E5). It stands **before** the
 * adjective, as every Japanese modifier does, and replaces the degree adverb rather than joining it:
 * 犬より大きい "bigger than the dog" (not もっと), 犬と同じくらい大きい "as big as the dog", and the
 * negative-polarity 犬ほど大きくない "less big than (not as big as) the dog". A particle, not a
 * preposition, so the standard needs no article or case of its own.
 */
export const JA_STANDARD: Partial<Record<Degree, string>> = { more: 'より', less: 'ほど', equally: 'と同じくらい' };

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
  // Time — に, the particle that places an act at a point in time (この日に), the same one the
  // terminus takes. The other five relations swap it for their own; see JA_TEMPORAL.
  temporal: 'に',
  // Terminus (dative recipient) — the same に that marks the indirect object ("猫に").
  terminus: 'に',
  // Comitative (companion) — と, the particle that joins one party to another ("犬と歩く"). It is
  // not the で of the instrument: Japanese keeps the companion and the means apart, where every
  // other engine here spells both "with".
  comitative: 'と',
  // Object complement: the factitive に, the same one the subject complement takes — "この文を命令
  // にする" is what "この文が命令になる" becomes under a causer. The essive reading takes として
  // instead, which `complementSegs` supplies.
  objectPredicative: 'に',
  // Subject complement: a noun/na-adjective predicate takes に (伝説になる); an i-adjective
  // takes its adverbial く-form with no particle (楽しくなる). Handled specially in
  // complementSegs — this に is the noun/na-adjective default.
  predicative: 'に',
};

/**
 * The postposition each temporal relation takes (C29). Every one of the six is a postposition in
 * Japanese, so they all go through the ordinary particle path — unlike English, Italian, French,
 * Spanish and Portuguese, where "ago" is not an adposition at all.
 *
 * **前に and の前に are different words.** 「瞬間前に」 measures back from now ("a moment ago");
 * 「この日の前に」 places the act earlier than a named time ("before this day"). Japanese tells the
 * two apart by the の alone, which is why `ago` and `before` are separate rows here and why neither
 * can borrow the other's particle.
 *
 * Split into a relational `noun` and a `particle`, the way REL_NOUN and PARTICLE split a place:
 * the kanji part takes its furigana through `wordSeg`, and the plain kana particle is left for
 * `jaParticleSegs`, which a focus particle or the negative circumfix's も replaces or follows.
 *
 * The `at` row's に is the fallback; a lexeme naming its own `temporal_prep` wins, as one naming
 * `locative_particle` wins over the locative's で.
 */
export const JA_TEMPORAL: Record<TemporalRelation, { noun: string; reading?: string; particle: string }> = {
  at: { noun: '', particle: 'に' },
  ago: { noun: '前', reading: 'まえ', particle: 'に' },
  until: { noun: '', particle: 'まで' },
  after: { noun: 'の後', reading: 'のあと', particle: 'に' },
  before: { noun: 'の前', reading: 'のまえ', particle: 'に' },
  during: { noun: 'の間', reading: 'のあいだ', particle: 'に' },
};

/** The essive marker: the object *taken as* the complement rather than made into it. */
export const JA_ESSIVE = 'として';

/** The final-clause marker: 〜ために on the dictionary form ("変更するためにクリック"). */
export const JA_PURPOSE = 'ために';

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
 *
 * P09-E1. `on` takes の上, **the same noun as `over`**: Japanese does not tell support from
 * superiority, and the collision is deliberate — 〜の表面に for contact is a paraphrase, not a
 * relation. `between` is の間, which follows the whole coordinated group as every relational noun
 * here does (家と木の間で), so it needs nothing of the group scope the other engines build.
 * `against` adds no noun at all: Japanese carries contact in the verb (もたれる, "to lean"), so it is
 * the one relation rendered with a particle alone — に, see `AGAINST_PARTICLE` — a known flattening.
 */
export const REL_NOUN: Record<PathSpecifier, string> = {
  in: '',
  through: '',
  under: 'の下',
  over: 'の上',
  around: 'の周り',
  behind: 'の後ろ',
  in_front_of: 'の前',
  on: 'の上',
  between: 'の間',
  against: '',
};

/**
 * The particle `against` takes in place of its complement's own, on a place and a goal: plain に,
 * what contact takes where the verb names it (壁に寄りかかる, 壁にぶつかる). Japanese has no adposition
 * for the relation itself (see `REL_NOUN`), so this is a flattening — "sleeps against the wall"
 * comes out 壁に寝ます — and it is pinned as one (P09-E1 D3). A route keeps its own を, which marks
 * the traversal and not the relation (壁を行きます).
 */
export const AGAINST_PARTICLE = 'に';

/**
 * The same relations as they are **cited** — named out of a sentence, for a label (see
 * `translateSpecifier`). A clause builds a place from the relational noun above plus its particle
 * (ベッドの下で), and two relations add no noun at all: plain containment and a plain traversal are
 * carried by the particle alone (家で, 市場を), so deriving a label would name both 「で」. Cited on
 * their own they take the 中 and the 通る the particle leaves implicit, which is how a dictionary
 * writes them. Whole tails rather than a noun plus a particle, because traversal ends in a te-form
 * (を通って) and not in a case particle at all. A clause borrows the traversal tail for a *locative*
 * `through` (家を通って走ります, see `complementSegs`): a route's を marks the path, but a place's で
 * says only where.
 */
export const PATH_CITATION: Record<PathSpecifier, string> = {
  in: 'の中で',
  through: 'を通って',
  under: 'の下で',
  over: 'の上で',
  around: 'の周りで',
  behind: 'の後ろで',
  in_front_of: 'の前で',
  on: 'の上で',
  between: 'の間で',
  against: 'に',
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
  on: 'のうえ',
  between: 'のあいだ',
  against: '',
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

/**
 * The cardinals Japanese spells (see `numeralWord`, C31). They agree with nothing, and they never
 * stand on their own: a counted noun phrase is numeral + the noun's own **counter** (二匹の猫,
 * 二十四時間), which `jaCounted` builds.
 */
export const CARDINALS: CardinalTable = {
  1: { word: '一' }, 2: { word: '二' }, 3: { word: '三' }, 4: { word: '四' },
  5: { word: '五' }, 6: { word: '六' }, 7: { word: '七' }, 8: { word: '八' },
  9: { word: '九' }, 10: { word: '十' }, 11: { word: '十一' }, 12: { word: '十二' },
  24: { word: '二十四' },
};
