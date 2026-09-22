import { describe, expect, test } from 'vitest';
import type { ResolvedModal } from '../../types.js';
import { concept, HITSUYOU_GA_ARU, IKU, KOTO_GA_DEKIRU, modal, TABERU, TAI } from './ja.fixtures.js';
import { modalSegs } from './modalSegs.js';

const MUST = modal(HITSUYOU_GA_ARU);
const CAN = modal(KOTO_GA_DEKIRU);
const WANT = modal(TAI);
/** An inner link denied on its own (A03): its negation rides its own suffix, not the finite ending. */
const not = (m: ResolvedModal): ResolvedModal => ({ ...m, negative: true });
/** 行く with its seeded nai-form, which a governed negation is built on (see plainVerbSeg). */
const IKANAI = { ...IKU, nai: '行かない', nai_reading: 'いかない' };

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

  // ── A03: polarity per word of the chain ───────────────────────────────────
  // The finite `negative` denies the outermost link; `governedNegative` denies the group the
  // innermost modal governs; an inner link denies its own suffix.
  describe('modal polarity', () => {
    const chain = (
      modals: ResolvedModal[],
      governedNegative: boolean,
      negative = false,
      ending: 'polite' | 'plain' | 'tara' = 'polite',
    ) => text(modalSegs(modals, concept(IKANAI), 'present', negative, 0, undefined, ending, undefined, governedNegative));

    test('a dict governor attaches straight to the ない form', () => {
      expect(chain([MUST], true)).toBe('行かない必要があります');
      expect(chain([CAN], true)).toBe('行かないことができます');
    });

    // 〜たい has no ない stem to sit on, so the negation goes through 〜ないでいる (see naiSegs).
    test('a stem governor goes through the 〜ないでい bridge', () => {
      expect(modalSegs([WANT], concept(IKANAI), 'present', false, 0, undefined, 'polite', undefined, true)).toEqual([
        { t: '行かない', r: 'いかない' },
        { t: 'でい' },
        { t: 'た' },
        { t: 'いです' },
      ]);
      expect(chain([WANT], true)).toBe('行かないでいたいです');
    });

    test('the two negations are independent', () => {
      expect(chain([WANT], false, true)).toBe('行きたくないです');
      expect(chain([WANT], true, true)).toBe('行かないでいたくないです');
      expect(chain([MUST], false, true)).toBe('行く必要がありません');
      expect(chain([MUST], true, true)).toBe('行かない必要がありません');
    });

    test('an inner link wears its own negation on its own suffix', () => {
      expect(chain([MUST, not(CAN)], false)).toBe('行くことができない必要があります');
      expect(chain([MUST, CAN], true)).toBe('行かないことができる必要があります');
      expect(chain([MUST, not(CAN)], true)).toBe('行かないことができない必要があります');
    });

    // The ようになる and と思う bridges stay compositional under either negation — as marginal as the
    // affirmative chains they are built on.
    test('the bridged chains keep their bridge', () => {
      expect(chain([WANT, not(CAN)], false)).toBe('行くことができないようになりたいです');
      expect(chain([WANT, CAN], true)).toBe('行かないことができるようになりたいです');
      expect(chain([CAN, not(WANT)], false)).toBe('行きたくないと思うことができます');
      expect(chain([CAN, WANT], true)).toBe('行かないでいたいと思うことができます');
    });

    test('the plain and たら endings carry the same governed ない', () => {
      expect(chain([MUST], true, false, 'plain')).toBe('行かない必要がある');
      expect(chain([WANT], true, false, 'plain')).toBe('行かないでいたい');
      expect(chain([MUST], true, false, 'tara')).toBe('行かない必要があったら');
      expect(chain([WANT], true, false, 'tara')).toBe('行かないでいたかったら');
    });

    test('a governed element of its own is negated in the form the modal asks for', () => {
      const governed = (form: 'dict' | 'stem', negative: boolean) =>
        [{ t: '幸せ' }, { t: negative ? (form === 'dict' ? 'でない' : 'でないでい') : (form === 'dict' ? 'である' : 'であり') }];
      expect(text(modalSegs([MUST], concept(IKANAI), 'present', false, 0, undefined, 'polite', governed, true)))
        .toBe('幸せでない必要があります');
      expect(text(modalSegs([WANT], concept(IKANAI), 'present', false, 0, undefined, 'polite', governed, true)))
        .toBe('幸せでないでいたいです');
    });
  });
});
