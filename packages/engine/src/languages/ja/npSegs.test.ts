import { describe, expect, test } from 'vitest';
import {
  adj, CHAIRO, CHIISAI, el, FUREEZU, HITO_GENERIC, HON, IMITEKI, INU, KODOMO, MIZU, NEKO, NEZUMI, NOMU, np, nounModifier, OOKII,
  SHIAWASE, SOUZOUSHA, vp, WATASHI, YOMU,
} from './ja.fixtures.js';
import { npSegs } from './npSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('npSegs', () => {
  test('a bare head noun, with its furigana', () => {
    expect(npSegs(np(NEKO))).toEqual([{ t: '猫', r: 'ねこ' }]);
    expect(npSegs(np(NEZUMI))).toEqual([{ t: 'ネズミ' }]);
  });

  test('stacked adjectives run straight into each other and the head', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII), adj(CHAIRO)] }))).toEqual([
      { t: '大きい', r: 'おおきい' },
      { t: '茶色の', r: 'ちゃいろの' },
      { t: '猫', r: 'ねこ' },
    ]);
    expect(text(npSegs(np(INU, {}, { adjectives: [adj(SHIAWASE), adj(CHIISAI)] })))).toBe('幸せな小さい犬');
  });

  test('a degree adverb binds to its adjective', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'more' })] }))).toEqual([
      { t: 'もっと' },
      { t: '大きい', r: 'おおきい' },
      { t: '猫', r: 'ねこ' },
    ]);
    expect(text(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'most' })] })))).toBe('最も大きい猫');
  });

  test('a lowered degree negates the adjective', () => {
    expect(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII, { degree: 'less' })] }))).toEqual([
      { t: 'それほど' },
      { t: '大きくない', r: 'おおきくない' },
      { t: '猫', r: 'ねこ' },
    ]);
  });

  test('the articles spell nothing', () => {
    expect(text(npSegs(np(NEKO, { definiteness: 'definite' })))).toBe('猫');
    expect(text(npSegs(np(NEKO, { definiteness: 'indefinite' })))).toBe('猫');
    expect(text(npSegs(np(MIZU, { definiteness: 'bare' })))).toBe('水');
  });

  test('a demonstrative or quantifier leads the phrase, ahead of its adjectives', () => {
    expect(npSegs(np(NEKO, { definiteness: 'this' }))).toEqual([{ t: 'この' }, { t: '猫', r: 'ねこ' }]);
    expect(text(npSegs(np(INU, { definiteness: 'that' })))).toBe('その犬');
    expect(text(npSegs(np(HON, { definiteness: 'some', number: 'plural' })))).toBe('いくつかの本');
    expect(text(npSegs(np(NEKO, { definiteness: 'many', number: 'plural' })))).toBe('多くの猫');
    expect(text(npSegs(np(MIZU, { definiteness: 'few' })))).toBe('少しの水');
    expect(text(npSegs(np(NEKO, { definiteness: 'all', number: 'plural' }, { adjectives: [adj(OOKII)] })))).toBe('すべての大きい猫');
  });

  test('the no determiner is the circumfix どの … も around the head', () => {
    expect(npSegs(np(NEKO, { definiteness: 'no' }))).toEqual([{ t: 'どの' }, { t: '猫', r: 'ねこ' }, { t: 'も' }]);
  });

  test('a noun possessor precedes the head, linked by の, and nests', () => {
    expect(npSegs(np(HON, {}, { possessor: np(NEKO) }))).toEqual([
      { t: '猫', r: 'ねこ' },
      { t: 'の' },
      { t: '本', r: 'ほん' },
    ]);
    expect(text(npSegs(np(HON, {}, { possessor: np(NEKO, {}, { possessor: np(KODOMO) }) })))).toBe('子供の猫の本');
  });

  test('a pronominal possessor is the pronoun + の, before the adjectives', () => {
    const hers = np(INU, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } });
    expect(npSegs(hers)).toEqual([{ t: '彼女', r: 'かのじょ' }, { t: 'の' }, { t: '犬', r: 'いぬ' }]);
    const mine = np(HON, {}, { adjectives: [adj(OOKII)], possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(text(npSegs(mine))).toBe('私の大きい本');
  });

  test('an attributive noun is の-linked, its own adjectives before it', () => {
    const creator = np(SOUZOUSHA, {}, { nounModifiers: [nounModifier(FUREEZU, [adj(IMITEKI)])] });
    expect(npSegs(creator)).toEqual([
      { t: '意味的な', r: 'いみてきな' },
      { t: 'フレーズ' },
      { t: 'の' },
      { t: '創造者', r: 'そうぞうしゃ' },
    ]);
  });

  test('every modifier relation renders the same の', () => {
    for (const relation of ['feature', 'purpose', 'material'] as const) {
      expect(text(npSegs(np(HON, {}, { nounModifiers: [nounModifier(KODOMO, [], relation)] })))).toBe('子供の本');
    }
  });

  test('a subject relative clause precedes the phrase in the plain form', () => {
    const drinks = { headRole: 'subject' as const, verbPhrase: vp(NOMU), directObject: el(np(MIZU)) };
    expect(npSegs(np(NEKO, {}, { relative: drinks }))).toEqual([
      { t: '水', r: 'みず' },
      { t: 'を' },
      { t: '飲む', r: 'のむ' },
      { t: '猫', r: 'ねこ' },
    ]);
    const drank = { ...drinks, verbPhrase: vp(NOMU, { tense: 'past' }) };
    expect(text(npSegs(np(NEKO, {}, { adjectives: [adj(OOKII)], relative: drank })))).toBe('水を飲んだ大きい猫');
  });

  test('a non-subject relative clause leads with its own subject and が', () => {
    const iRead = { headRole: 'directObject' as const, subject: el(np(WATASHI)), verbPhrase: vp(YOMU) };
    expect(npSegs(np(HON, {}, { relative: iRead }))).toEqual([
      { t: '私', r: 'わたし' },
      { t: 'が' },
      { t: '読む', r: 'よむ' },
      { t: '本', r: 'ほん' },
    ]);
  });

  test('a generic relative-clause subject is dropped', () => {
    const oneReads = { headRole: 'directObject' as const, subject: el(np(HITO_GENERIC)), verbPhrase: vp(YOMU) };
    expect(text(npSegs(np(HON, {}, { relative: oneReads })))).toBe('読む本');
  });
});
