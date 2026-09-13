import { describe, expect, test } from 'vitest';
import { concept, HITSUYOU_GA_ARU, IKU, KOTO_GA_DEKIRU, TABERU, TAI } from './ja.fixtures.js';
import { modalSegs } from './modalSegs.js';

const MUST = concept(HITSUYOU_GA_ARU);
const CAN = concept(KOTO_GA_DEKIRU);
const WANT = concept(TAI);

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('modalSegs', () => {
  test('with no modal left, the verb in its dictionary form', () => {
    expect(modalSegs([], concept(TABERU), 'present', false)).toEqual([{ t: '食べる', r: 'たべる' }]);
  });

  test('〜必要がある takes the dictionary form and carries the ます ending', () => {
    expect(modalSegs([MUST], concept(IKU), 'present', false)).toEqual([
      { t: '行く', r: 'いく' },
      { t: '必要があり', r: 'ひつようがあり' },
      { t: 'ます' },
    ]);
  });

  test('〜ことができる inflects for tense and polarity', () => {
    expect(text(modalSegs([CAN], concept(TABERU), 'present', true))).toBe('食べることができません');
    expect(text(modalSegs([CAN], concept(TABERU), 'past', true))).toBe('食べることができませんでした');
  });

  test('〜たい takes the polite stem and inflects as an i-adjective', () => {
    expect(modalSegs([WANT], concept(IKU), 'present', false)).toEqual([
      { t: '行き', r: 'いき' },
      { t: 'た' },
      { t: 'いです' },
    ]);
    expect(text(modalSegs([WANT], concept(IKU), 'present', true))).toBe('行きたくないです');
    expect(text(modalSegs([WANT], concept(TABERU), 'past', false))).toBe('食べたかったです');
  });

  test('two verb-kind modals stack, the inner one bare in its dictionary shape', () => {
    expect(text(modalSegs([MUST, CAN], concept(TABERU), 'present', false))).toBe('食べることができる必要があります');
    expect(text(modalSegs([MUST, CAN], concept(TABERU), 'present', true))).toBe('食べることができる必要がありません');
  });

  test('〜たい over a verb-kind modal is bridged with ようになる', () => {
    expect(modalSegs([WANT, CAN], concept(TABERU), 'present', false)).toEqual([
      { t: '食べる', r: 'たべる' },
      { t: 'ことができる' },
      { t: 'ように' },
      { t: 'なり' },
      { t: 'た' },
      { t: 'いです' },
    ]);
    expect(text(modalSegs([WANT, CAN], concept(TABERU), 'present', true))).toBe('食べることができるようになりたくないです');
    expect(text(modalSegs([WANT, CAN], concept(TABERU), 'past', false))).toBe('食べることができるようになりたかったです');
  });

  test('a verb-kind modal over 〜たい is bridged with と思う', () => {
    expect(modalSegs([CAN, WANT], concept(TABERU), 'present', false)).toEqual([
      { t: '食べ', r: 'たべ' },
      { t: 'たい' },
      { t: 'と' },
      { t: '思う', r: 'おもう' },
      { t: 'ことができ' },
      { t: 'ます' },
    ]);
    expect(text(modalSegs([MUST, WANT], concept(TABERU), 'past', false))).toBe('食べたいと思う必要がありました');
  });

  test('a bridged pair nests under a further modal', () => {
    expect(text(modalSegs([MUST, CAN, WANT], concept(TABERU), 'present', false))).toBe('食べたいと思うことができる必要があります');
  });
});
