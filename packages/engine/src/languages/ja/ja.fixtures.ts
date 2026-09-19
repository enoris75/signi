import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Japanese function-level unit tests. The forms mirror the seeded
// Japanese lexicon (packages/backend/src/concepts, the te-forms from verbs/nonfinite.ts) plus the
// keys the lexicon and translator thread onto them (role, animate, uncountable, proper,
// mannerRelation, dimensionRelation, definiteness, number, degree…), trimmed to what the functions
// read — so each test shows exactly which forms drive its output. `reading` is the furigana; an
// all-kana word carries none (or a redundant one, which the engine drops). Rendering through the
// real lexicon is covered by the sentence-level suite in packages/engine/test. The builders come
// from the language-neutral `resolved.fixtures.ts`.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const NEKO: Forms = { base: '猫', count: 'singular', reading: 'ねこ', animate: '1' };
export const INU: Forms = { base: '犬', count: 'singular', reading: 'いぬ', animate: '1' };
/** A katakana noun, seeded with no reading. */
export const KITSUNE: Forms = { base: 'キツネ', count: 'singular', animate: '1' };
/** A katakana noun seeded with a redundant hiragana reading (which must take no ruby). */
export const NEZUMI: Forms = { base: 'ネズミ', count: 'singular', reading: 'ねずみ', animate: '1' };
export const FUREEZU: Forms = { base: 'フレーズ', count: 'singular', reading: 'ふれーず' };
export const OTOKONOKO: Forms = { base: '男の子', count: 'singular', reading: 'おとこのこ', animate: '1', human: '1' };
export const KODOMO: Forms = { base: '子供', count: 'singular', reading: 'こども', animate: '1', human: '1' };
export const HITO: Forms = { base: '人', count: 'singular', reading: 'ひと', animate: '1', human: '1' };
export const HON: Forms = { base: '本', count: 'singular', reading: 'ほん' };
export const IE: Forms = { base: '家', count: 'singular', reading: 'いえ' };
export const KABE: Forms = { base: '壁', count: 'singular', reading: 'かべ' };
export const BASHO: Forms = { base: '場所', count: 'singular', reading: 'ばしょ' };
export const ICHIBA: Forms = { base: '市場', count: 'singular', reading: 'いちば' };
export const TANGO: Forms = { base: '単語', count: 'singular', reading: 'たんご' };
export const DENSETSU: Forms = { base: '伝説', count: 'singular', reading: 'でんせつ' };
export const SOUZOUSHA: Forms = { base: '創造者', count: 'singular', reading: 'そうぞうしゃ', animate: '1' };
export const HIKARI: Forms = { base: '光', count: 'singular', reading: 'ひかり' };
/** A mass noun. */
export const MIZU: Forms = { base: '水', count: 'singular', reading: 'みず', uncountable: '1' };
/** A proper name, written in katakana. */
export const AFURIKA: Forms = { base: 'アフリカ', count: 'singular', proper: '1', uncountable: '1' };
export const YOOROPPA: Forms = { base: 'ヨーロッパ', count: 'singular', proper: '1', uncountable: '1' };
/** A proper name written in kanji, with its reading. */
export const HOKUBEI: Forms = { base: '北米', count: 'singular', reading: 'ほくべい', proper: '1', uncountable: '1' };

// Manner nouns (their `mannerRelation` picks the manner adposition).
export const HAYASA: Forms = { base: '速さ', count: 'singular', reading: 'はやさ', mannerRelation: 'measure' };
export const HOUHOU: Forms = { base: '方法', count: 'singular', reading: 'ほうほう', mannerRelation: 'mode' };
export const JIKAN: Forms = { base: '時間', count: 'singular', reading: 'じかん', mannerRelation: 'measure' };
/** An uncountable means noun. */
export const CHUUI: Forms = { base: '注意', count: 'singular', reading: 'ちゅうい', uncountable: '1', mannerRelation: 'means' };

// Dimension nouns (their `dimensionRelation` picks the adjective-gloss adposition).
export const OOKISA: Forms = { base: '大きさ', count: 'singular', reading: 'おおきさ', dimensionRelation: 'extent' };
export const TAKASA: Forms = { base: '高さ', count: 'singular', reading: 'たかさ', dimensionRelation: 'extent' };
export const SHITSU: Forms = { base: '質', count: 'singular', reading: 'しつ', dimensionRelation: 'quality' };
export const ONDO: Forms = { base: '温度', count: 'singular', reading: 'おんど', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────

export const WATASHI: Forms = { base: '私', person: '1', number: 'singular', plural: '私たち', reading: 'わたし', plural_reading: 'わたしたち' };
/** All kana: no reading. */
export const ANATA: Forms = { base: 'あなた', person: '2', number: 'singular', plural: 'あなたたち' };
export const KARE: Forms = {
  base: '彼', person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女', singular_neut: 'それ', plural: '彼ら',
  reading: 'かれ', singular_fem_reading: 'かのじょ', singular_neut_reading: 'それ', plural_reading: 'かれら',
};
/** The generic / impersonal "one" — dropped as a Japanese subject. */
export const HITO_GENERIC: Forms = { base: '人', person: '3', number: 'singular', generic: '1', reading: 'ひと' };

// ── Adjectives ──────────────────────────────────────────────────────────────

// i-adjectives (…い).
export const OOKII: Forms = { role: 'adjective', base: '大きい', reading: 'おおきい' };
export const CHIISAI: Forms = { role: 'adjective', base: '小さい', reading: 'ちいさい' };
export const TAKAI: Forms = { role: 'adjective', base: '高い', reading: 'たかい' };
export const YOI: Forms = { role: 'adjective', base: '良い', reading: 'よい' };
export const WAKAI: Forms = { role: 'adjective', base: '若い', reading: 'わかい' };
export const HAYAI: Forms = { role: 'adjective', base: '速い', reading: 'はやい' };
export const OMOSHIROI: Forms = { role: 'adjective', base: '面白い', reading: 'おもしろい' };
// na-adjectives, stored with their attributive な.
export const SHIAWASE: Forms = { role: 'adjective', base: '幸せな', reading: 'しあわせな' };
export const SHINCHOU: Forms = { role: 'adjective', base: '慎重な', reading: 'しんちょうな' };
export const IMITEKI: Forms = { role: 'adjective', base: '意味的な', reading: 'いみてきな' };
// の-linked nominal adjectives.
export const CHAIRO: Forms = { role: 'adjective', base: '茶色の', reading: 'ちゃいろの' };
export const OTONA: Forms = { role: 'adjective', base: '大人の', reading: 'おとなの' };
/** A past-participle adjective (…た). */
export const TSUKARETA: Forms = { role: 'adjective', base: '疲れた', reading: 'つかれた' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const HAYAKU: Forms = { base: '速く', reading: 'はやく' };
/** All kana: no reading. */
export const YUKKURI: Forms = { base: 'ゆっくり' };
export const ISSHONI: Forms = { base: '一緒に', reading: 'いっしょに' };
export const ITSUMO: Forms = { base: 'いつも', subtype: 'frequency' };
/** A negative-polarity frequency adverb: it forces the predicate negative (決して…ません). */
export const KESSHITE: Forms = { base: '決して', subtype: 'frequency', polarity: 'negative', reading: 'けっして' };

// ── Verbs ───────────────────────────────────────────────────────────────────

/** An ichidan (-ru) verb. */
export const TABERU: Forms = {
  base: '食べる', reading: 'たべる', masu_present: '食べます', masu_present_reading: 'たべます',
  te: '食べて', te_reading: 'たべて',
};
export const MIRU: Forms = {
  base: '見る', reading: 'みる', masu_present: '見ます', masu_present_reading: 'みます',
  te: '見て', te_reading: 'みて',
};
/** A godan verb with the irregular te-form 行って. */
export const IKU: Forms = {
  base: '行く', reading: 'いく', masu_present: '行きます', masu_present_reading: 'いきます',
  te: '行って', te_reading: 'いって',
};
/** A godan -mu verb: the voiced te-form 飲んで. */
export const NOMU: Forms = {
  base: '飲む', reading: 'のむ', masu_present: '飲みます', masu_present_reading: 'のみます',
  te: '飲んで', te_reading: 'のんで',
};
export const YOMU: Forms = {
  base: '読む', reading: 'よむ', masu_present: '読みます', masu_present_reading: 'よみます',
  te: '読んで', te_reading: 'よんで',
};
/** A godan -bu verb: the voiced te-form 選んで. */
export const ERABU: Forms = {
  base: '選ぶ', reading: 'えらぶ', masu_present: '選びます', masu_present_reading: 'えらびます',
  te: '選んで', te_reading: 'えらんで',
};
/** A godan -ku verb: the te-form 泣いて. */
export const NAKU: Forms = {
  base: '泣く', reading: 'なく', masu_present: '泣きます', masu_present_reading: 'なきます',
  te: '泣いて', te_reading: 'ないて',
};
/** The irregular 来る: the kanji reads く in the dictionary form, き in the stem. */
export const KURU: Forms = {
  base: '来る', reading: 'くる', masu_present: '来ます', masu_present_reading: 'きます',
  te: '来て', te_reading: 'きて',
};
/** A suru verb, with the verbal-noun `label` Japanese UI instructions use. */
export const HOZON_SURU: Forms = {
  base: '保存する', reading: 'ほぞんする', masu_present: '保存します', masu_present_reading: 'ほぞんします', label: '保存',
  te: '保存して', te_reading: 'ほぞんして',
};
/** BECOME: all kana, so every reading equals its surface. */
export const NARU: Forms = {
  base: 'なる', reading: 'なる', masu_present: 'なります', masu_present_reading: 'なります',
  te: 'なって', te_reading: 'なって',
};
/** GIVE: all kana, seeded with no dictionary or ます reading. */
export const AGERU: Forms = { base: 'あげる', masu_present: 'あげます', te: 'あげて', te_reading: 'あげて' };
/** SEEM: a state, but 思える is itself a Japanese state verb, so it takes no 〜ている. */
export const OMOERU: Forms = {
  base: '思える', reading: 'おもえる', masu_present: '思えます', masu_present_reading: 'おもえます',
  te: '思えて', te_reading: 'おもえて', stative: '1', state_verb: '1',
};
/** KNOW: a state (知っています), whose negative is the event's (知りません). */
export const SHIRU: Forms = {
  base: '知る', reading: 'しる', masu_present: '知ります', masu_present_reading: 'しります',
  te: '知って', te_reading: 'しって', nai: '知らない', nai_reading: 'しらない', stative: '1', event_negative: '1',
};
/** HAVE: a state, said with 〜ている (持っています); an inanimate owner's is the existential ある (A150). */
export const MOTSU: Forms = {
  base: '持つ', reading: 'もつ', masu_present: '持ちます', masu_present_reading: 'もちます',
  te: '持って', te_reading: 'もって', nai: '持たない', nai_reading: 'もたない', stative: '1', inanimate_aru: '1',
};
/** BE: rendered specially as the copula on its predicate; these forms are only a fallback. */
export const DESU: Forms = { base: 'です', copula: '1', masu_present: 'です' };

// ── Modals ──────────────────────────────────────────────────────────────────
// Japanese modality is suffixal: `governs` is the form the suffix attaches to, `suffix_dict` /
// `suffix_stem` its own dictionary and polite-stem shapes, `kind` whether it inflects as a verb or
// as the i-adjective 〜たい.

/** MUST: 〜必要がある, on the dictionary form. */
export const HITSUYOU_GA_ARU: Forms = {
  base: '必要がある', reading: 'ひつようがある', kind: 'verb', governs: 'dict',
  suffix_dict: '必要がある', suffix_dict_reading: 'ひつようがある',
  suffix_stem: '必要があり', suffix_stem_reading: 'ひつようがあり',
};
/** CAN: 〜ことができる, on the dictionary form; all kana. */
export const KOTO_GA_DEKIRU: Forms = {
  base: 'ことができる', kind: 'verb', governs: 'dict', suffix_dict: 'ことができる', suffix_stem: 'ことができ',
};
/** WANT (the WILL concept): 〜たい, an i-adjective on the polite stem. */
export const TAI: Forms = { base: 'たい', kind: 'iadj', governs: 'stem', suffix_dict: 'たい', suffix_stem: 'たく' };
