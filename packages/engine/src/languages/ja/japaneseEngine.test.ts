import { describe, expect, test } from 'vitest';
import {
  CHAIRO, clause, concept, el, type Forms, IKU, INU, NAKU, NEKO, NEZUMI, np, OTONA, SHINCHOU, TABERU, vp, WAKAI,
} from './ja.fixtures.js';
import { japaneseEngine } from './japaneseEngine.js';

/** A noun whose kana spelling happens to end in な. */
const SAKANA: Forms = { base: 'さかな', count: 'singular' };

const catEatsMouse = clause(np(NEKO), vp(TABERU), { directObject: el(np(NEZUMI)) });
// `renderWord` and `renderDeterminer` are optional on LanguageEngine; the Japanese engine implements both.
const word = (forms: Forms) => japaneseEngine.renderWord?.(concept(forms));
const menuDeterminer = (forms: Forms) => japaneseEngine.renderDeterminer?.(concept(forms));

describe('japaneseEngine', () => {
  test('is the Japanese engine, closing on 。 and joining words without spaces', () => {
    expect(japaneseEngine.language).toBe('ja');
    expect(japaneseEngine.terminator).toBe('。');
    expect(japaneseEngine.wordJoiner).toBe('');
  });

  test('renders the joined segments, leaving the full stop to the translator', () => {
    expect(japaneseEngine.render(catEatsMouse)).toBe('猫はネズミを食べます');
  });

  test('renders a conditional and a coordination', () => {
    const conditional = clause(np(INU), vp(NAKU, { mood: 'conditional' }), { condition: clause(np(NEKO), vp(TABERU, { mood: 'subjunctive' })) });
    expect(japaneseEngine.render(conditional)).toBe('もし猫が食べたら、犬は泣きます');
    expect(japaneseEngine.render({ ...catEatsMouse, coordination: { conjunction: 'but', clause: clause(np(INU), vp(IKU)) } }))
      .toBe('猫はネズミを食べます、しかし犬は行きます');
  });

  // A katakana word's redundant hiragana reading is dropped.
  test('renderRuby returns the segments with their furigana', () => {
    expect(japaneseEngine.renderRuby?.(catEatsMouse)).toEqual([
      { t: '猫', r: 'ねこ' }, { t: 'は' }, { t: 'ネズミ' }, { t: 'を' }, { t: '食べます', r: 'たべます' },
    ]);
  });

  test('renderWord gives a noun, a verb or an i-adjective its base', () => {
    expect(word(NEKO)).toBe('猫');
    expect(word(TABERU)).toBe('食べる');
    expect(word(WAKAI)).toBe('若い');
    expect(word(SAKANA)).toBe('さかな');
  });

  test('renderWord drops the attributive な or の of a lone adjective', () => {
    expect(word(SHINCHOU)).toBe('慎重');
    expect(word(CHAIRO)).toBe('茶色');
    expect(word(OTONA)).toBe('大人');
  });

  test('renderWord without a base is empty', () => {
    expect(word({})).toBe('');
    expect(word({ role: 'adjective' })).toBe('');
  });

  test('renderDeterminer spells no article', () => {
    expect(menuDeterminer(NEKO)).toBe('');
    expect(menuDeterminer({ ...NEKO, definiteness: 'definite' })).toBe('');
    expect(menuDeterminer({ ...NEKO, definiteness: 'indefinite' })).toBe('');
    expect(menuDeterminer({ ...NEKO, definiteness: 'bare' })).toBe('');
  });

  test('renderDeterminer names the demonstratives and quantifiers with their linking の', () => {
    expect(menuDeterminer({ ...NEKO, definiteness: 'this' })).toBe('この');
    expect(menuDeterminer({ ...NEKO, definiteness: 'that' })).toBe('その');
    expect(menuDeterminer({ ...NEKO, definiteness: 'some' })).toBe('いくつかの');
    expect(menuDeterminer({ ...NEKO, definiteness: 'many' })).toBe('多くの');
    expect(menuDeterminer({ ...NEKO, definiteness: 'all' })).toBe('すべての');
    expect(menuDeterminer({ ...NEKO, definiteness: 'no' })).toBe('どの…もない');
  });
});
