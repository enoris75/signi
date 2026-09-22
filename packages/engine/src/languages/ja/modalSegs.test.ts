import { describe, expect, test } from 'vitest';
import { BEKI, concept, HITSUYOU_GA_ARU, IKU, KAMOSHIRENAI, KOTO_GA_DEKIRU, MOTSU, TABERU, TAI } from './ja.fixtures.js';
import { modalSegs } from './modalSegs.js';

const MUST = concept(HITSUYOU_GA_ARU);
const CAN = concept(KOTO_GA_DEKIRU);
const WANT = concept(TAI);
const SHOULD = concept(BEKI);
const MIGHT = concept(KAMOSHIRENAI);

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

  // B63: 〜べき takes the dictionary form and closes as a predicate noun does.
  test('a copula-kind modal closes on the copula', () => {
    expect(text(modalSegs([SHOULD], concept(TABERU), 'present', false))).toBe('食べるべきです');
    expect(text(modalSegs([SHOULD], concept(TABERU), 'present', true))).toBe('食べるべきではありません');
    expect(text(modalSegs([SHOULD], concept(TABERU), 'past', false))).toBe('食べるべきでした');
  });

  // B63: 〜かもしれない is the one modal whose governed element is FINITE — the tense and the polarity
  // are said on it, and the suffix carries only the politeness.
  describe('〜かもしれない governs the plain finite form', () => {
    test('the verb before it carries the tense and the polarity', () => {
      expect(text(modalSegs([MIGHT], concept(TABERU), 'present', false))).toBe('食べるかもしれません');
      expect(text(modalSegs([MIGHT], concept(TABERU), 'past', false))).toBe('食べたかもしれません');
      expect(text(modalSegs([MIGHT], concept(MOTSU), 'present', true))).toBe('持たないかもしれません');
      expect(text(modalSegs([MIGHT], concept(MOTSU), 'past', true))).toBe('持たなかったかもしれません');
    });

    test('a relative clause keeps the plain suffix, an "if" clause takes なら', () => {
      expect(text(modalSegs([MIGHT], concept(TABERU), 'past', false, 0, undefined, 'plain'))).toBe('食べたかもしれない');
      expect(text(modalSegs([MIGHT], concept(TABERU), 'present', false, 0, undefined, 'tara'))).toBe('食べるかもしれないなら');
    });

    test('in a chain: the inner modal is the finite element, and governed it is the plain present', () => {
      expect(text(modalSegs([MIGHT, CAN], concept(TABERU), 'present', true))).toBe('食べることができないかもしれません');
      expect(text(modalSegs([MIGHT, SHOULD], concept(TABERU), 'present', false))).toBe('食べるべきであるかもしれません');
      expect(text(modalSegs([MUST, MIGHT], concept(TABERU), 'present', false))).toBe('食べるかもしれない必要があります');
    });
  });

  // A128: the copula's predicate stands in for the verb, in whichever form the innermost modal governs.
  test('the governed element can be something other than the verb', () => {
    const governed = (form: 'dict' | 'stem') => [{ t: '伝説' }, { t: form === 'dict' ? 'である' : 'であり' }];
    expect(text(modalSegs([MUST], concept(IKU), 'present', true, 0, undefined, 'polite', governed))).toBe('伝説である必要がありません');
    expect(text(modalSegs([WANT], concept(IKU), 'past', false, 0, undefined, 'polite', governed))).toBe('伝説でありたかったです');
    expect(text(modalSegs([WANT, CAN], concept(IKU), 'present', false, 0, undefined, 'plain', governed))).toBe('伝説であることができるようになりたい');
    expect(text(modalSegs([CAN, WANT], concept(IKU), 'present', false, 0, undefined, 'tara', governed))).toBe('伝説でありたいと思うことができたら');
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

  // A113: governed, the ようになる bridge keeps its 〜たい in the form the outer modal asks for.
  test('a governed ようになる bridge keeps its 〜たい', () => {
    expect(text(modalSegs([MUST, WANT, CAN], concept(TABERU), 'present', false))).toBe('食べることができるようになりたいと思う必要があります');
    expect(text(modalSegs([MUST, WANT, CAN], concept(TABERU), 'past', true))).toBe('食べることができるようになりたいと思う必要がありませんでした');
    expect(text(modalSegs([WANT, CAN], concept(TABERU), 'present', false, 0, 'stem'))).toBe('食べることができるようになりたく');
  });

  test('a bridged pair nests under a further modal', () => {
    expect(text(modalSegs([MUST, CAN, WANT], concept(TABERU), 'present', false))).toBe('食べたいと思うことができる必要があります');
  });
});
