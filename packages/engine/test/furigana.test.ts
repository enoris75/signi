import { describe, expect, test } from 'vitest';
import { clause, furigana, np } from './harness.js';
import type { PhrasePlan } from '@signi/shared';

// Japanese readings ride over the kanji as <ruby>/<rt> segments; the plain `text` is the segments
// joined. A word already written in kana reads as itself and gets no furigana.

describe('furigana: verbs', () => {
  test('the reading follows the INFLECTED surface, not the lemma', () => {
    expect(furigana(clause(np('CAT'), 'EAT'))).toEqual(['ねこ', 'たべます']);
    expect(furigana(clause(np('CAT'), 'EAT', { verbPhrase: { tense: 'past' } })))
      .toEqual(['ねこ', 'たべました']);
  });
});

// The reading over each kanji-bearing noun. Rendered as a bare subject (a verbless period) so the
// only ruby in the sentence is the noun's own. The reading is the ground truth, hard-coded here
// rather than read back from the corpus — so this catches a corrupted seed reading as well as an
// engine regression.
const bare = (id: string): string[] => furigana({ subject: np(id) } as PhrasePlan);

// Pure-kanji nouns: the whole surface is kanji, so the reading annotates it exactly.
const KANJI_NOUNS: [id: string, reading: string][] = [
  ['ADJECTIVE', 'けいようし'], ['ADVERB', 'ふくし'], ['ANGEL', 'てんし'], ['ANIMAL', 'どうぶつ'],
  ['ANTARCTICA', 'なんきょくたいりく'], ['ARTICLE', 'かんし'], ['BOOK', 'ほん'], ['BUILDER', 'けんちくしゃ'],
  ['BUTCHER', 'にくや'], ['CAT', 'ねこ'], ['CAUSE', 'げんいん'], ['CHILD', 'こども'], ['COIN', 'こうか'],
  ['COMMAND', 'めいれい'], ['CONCEPT', 'がいねん'], ['CONTAINER', 'ようき'], ['CONTINENT', 'たいりく'],
  ['COW', 'うし'], ['CREATOR', 'そうぞうしゃ'], ['DEATH', 'し'], ['DEMONSTRATIVE', 'しじし'],
  ['DETERMINER', 'げんていし'], ['DOG', 'いぬ'], ['ENGLISH', 'えいご'], ['FATHER', 'ちち'], ['FIRE', 'ひ'],
  ['GENDER', 'せい'], ['HOME', 'いえ'], ['HOUSE', 'いえ'], ['INSTRUCTION', 'しじ'],
  ['INSTRUMENTAL', 'しゅだんご'], ['JAPANESE', 'にほんご'], ['LANGUAGE', 'げんご'], ['LEGEND', 'でんせつ'],
  ['MAMMAL', 'ほにゅうるい'], ['MAN', 'おとこ'], ['MAP', 'ちず'], ['MARKET', 'いちば'],
  ['NORTH_AMERICA', 'ほくべい'], ['NOUN', 'めいし'], ['NUMBER', 'かず'], ['NUMBER_GRAMMAR', 'すう'],
  ['OBJECT_GRAMMAR', 'もくてきご'], ['OBJECT_THING', 'ぶったい'], ['ORDER', 'めいれい'], ['OX', 'おうし'],
  ['PERIOD_PUNCTUATION', 'くてん'], ['PERIOD_SENTENCE', 'ぶん'], ['PERIOD_TIME', 'きかん'],
  ['PERSON', 'ひと'], ['PERSON_GRAMMAR', 'にんしょう'], ['PLURAL_GRAMMAR', 'ふくすう'],
  ['POSSESSOR', 'しょゆうしゃ'], ['PRISON', 'けいむしょ'], ['PROCESS', 'かてい'], ['PRONOUN', 'だいめいし'],
  ['QUANTIFIER', 'すうりょうし'], ['RELATIONSHIP', 'かんけい'], ['SINGULAR_GRAMMAR', 'たんすう'],
  ['SOUTH_AMERICA', 'なんべい'], ['STICK', 'ぼう'], ['SUBJECT_COMPLEMENT', 'しゅかくほご'],
  ['SUBJECT_GRAMMAR', 'しゅご'], ['TRANSLATION', 'ほんやく'], ['VERB', 'どうし'], ['WATER', 'みず'],
  ['WING', 'つばさ'], ['WOLF', 'おおかみ'], ['WORD', 'たんご'],
];

describe('furigana: every kanji noun', () => {
  test.each(KANJI_NOUNS)('%s reads as %s', (id, reading) => {
    expect(bare(id)).toEqual([reading]);
  });

  test('the reading is per-concept, so one kanji can read two ways', () => {
    // 数 is かず as a plain "number" but すう as the grammatical category — same kanji, and the
    // engine picks the concept's own reading rather than a single dictionary default.
    expect(bare('NUMBER')).toEqual(['かず']);
    expect(bare('NUMBER_GRAMMAR')).toEqual(['すう']);
  });

  test('HOUSE and HOME share the surface 家 and its reading', () => {
    expect(bare('HOUSE')).toEqual(['いえ']);
    expect(bare('HOME')).toEqual(['いえ']);
  });
});

// A word whose surface mixes kanji with kana. The engine annotates the WHOLE surface with the
// whole reading (a documented simplification) rather than segmenting per kanji — so the reading
// spans the kana too. Real furigana would mark only the kanji: 食[た]べ物[もの], フランス語[ご].
describe('furigana: mixed kanji and kana (whole-word ruby)', () => {
  test('okurigana falls inside the ruby span', () => {
    expect(bare('FOOD')).toEqual(['たべもの']); // 食べ物 — the べ is kana
    expect(bare('BOY')).toEqual(['おとこのこ']); // 男の子 — the の is kana
    expect(bare('YOUNG_WOMAN')).toEqual(['わかいじょせい']); // 若い女性 — the い is kana
  });

  test('a katakana loanword + 語 is ruby-ed as one span', () => {
    // Only the 語 needs a reading; the katakana part is spelled as it sounds. The whole-word ruby
    // puts ふらんす over フランス anyway.
    expect(bare('FRENCH')).toEqual(['ふらんすご']);
    expect(bare('GERMAN')).toEqual(['どいつご']);
    expect(bare('ITALIAN')).toEqual(['いたりあご']);
    expect(bare('SPANISH')).toEqual(['すぺいんご']);
    expect(bare('PORTUGUESE')).toEqual(['ぽるとがるご']);
  });
});

// A katakana noun reads as itself, so it takes no furigana. The engine gets this right for most
// of them — but not all; see the bug below.
describe('furigana: katakana nouns take none', () => {
  test.each(['AFRICA', 'ASIA', 'EUROPE', 'FOX', 'OCEANIA'])('%s has no reading', (id) => {
    expect(bare(id)).toEqual([]);
  });
});

describe('known bugs: furigana', () => {
  // The suppression rule is "reading === surface → no ruby", but it compares the two literally,
  // and a katakana word's seeded reading is written in HIRAGANA. ネズミ and its reading ねずみ are
  // the same word, differing only in kana type, so the comparison fails and the engine furiganas
  // a katakana word with hiragana — ネズミ[ねずみ]. Japanese never furiganas katakana.
  //
  // AFRICA/FOX/EUROPE escape it only because their seed carries no separate reading at all; MOUSE,
  // NODE, PHRASE, SLOT and SLOT_MACHINE were given a redundant hiragana one. The robust fix is in
  // the engine — compare kana-insensitively — so it holds however the corpus is seeded.
  test('MOUSE (ネズミ) should take no furigana, not ネズミ[ねずみ]', () => {
    expect(bare('MOUSE')).toEqual([]);
  });

  test('NODE (ノード) should take no furigana', () => {
    expect(bare('NODE')).toEqual([]);
  });

  test('PHRASE (フレーズ) should take no furigana', () => {
    expect(bare('PHRASE')).toEqual([]);
  });

  test('SLOT (スロット) should take no furigana', () => {
    expect(bare('SLOT')).toEqual([]);
  });

  test('SLOT_MACHINE (スロットマシン) should take no furigana', () => {
    expect(bare('SLOT_MACHINE')).toEqual([]);
  });

  // The suppression is a property of the word, not the position: a katakana noun anywhere in the
  // sentence contributes no ruby, while the kanji words around it still do — here 猫→ねこ and
  // 食べます→たべます are the only readings; the katakana object ネズミ adds none.
  test('a katakana noun takes no furigana in a full sentence either', () => {
    expect(furigana(clause(np('CAT'), 'EAT', { directObject: np('MOUSE') })))
      .toEqual(['ねこ', 'たべます']);
    // Regression: a kanji noun in the same slot keeps its reading.
    expect(furigana(clause(np('CAT'), 'EAT', { directObject: np('DOG') })))
      .toEqual(['ねこ', 'いぬ', 'たべます']);
  });
});
