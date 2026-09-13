import { describe, expect, test } from 'vitest';
import type { RubySegment } from '../../types.js';
import { AGERU, concept, type Forms, HOZON_SURU, IKU, KURU, TABERU } from './ja.fixtures.js';
import { jaImperativeSegs } from './jaImperativeSegs.js';

/** A する-verb seeded with no `label`. */
const SESSHU_SURU: Forms = { base: '摂取する', reading: 'せっしゅする', masu_present: '摂取します', masu_present_reading: 'せっしゅします' };

const text = (segs: RubySegment[]): string => segs.map((s) => s.t).join('');

describe('jaImperativeSegs', () => {
  describe('second person', () => {
    test('the polite request is the te-form + ください', () => {
      expect(jaImperativeSegs(concept(TABERU), '2sg', false)).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'ください' }]);
      expect(text(jaImperativeSegs(concept(IKU), '2pl', false))).toBe('行ってください');
    });

    test('a kana te-form takes no ruby', () => {
      expect(jaImperativeSegs(concept(AGERU), '2sg', false)).toEqual([{ t: 'あげて' }, { t: 'ください' }]);
    });

    // A deliberate register gap (see the source): the polite prohibitive ～ないでください needs the
    // nai-form the lexicon doesn't store, so the negative falls back to the plain ～な.
    test('the negative is the plain prohibitive ～な on the dictionary form', () => {
      expect(jaImperativeSegs(concept(TABERU), '2sg', true)).toEqual([{ t: '食べるな', r: 'たべるな' }]);
      expect(text(jaImperativeSegs(concept(IKU), '2pl', true))).toBe('行くな');
    });
  });

  describe('first person plural', () => {
    test('the cohortative is the masu-stem + ましょう', () => {
      expect(jaImperativeSegs(concept(TABERU), '1pl', false)).toEqual([{ t: '食べましょう', r: 'たべましょう' }]);
      expect(jaImperativeSegs(concept(KURU), '1pl', false)).toEqual([{ t: '来ましょう', r: 'きましょう' }]);
    });

    test('the negative rides やめましょう on the dictionary form', () => {
      expect(jaImperativeSegs(concept(TABERU), '1pl', true)).toEqual([{ t: '食べる', r: 'たべる' }, { t: 'のはやめましょう' }]);
    });
  });

  // Japanese labels a control with the verbal noun rather than commanding (C03).
  describe('instruction register', () => {
    test('labels with the seeded verbal noun, whoever is addressed', () => {
      expect(text(jaImperativeSegs(concept(HOZON_SURU), '2sg', false, true))).toBe('保存');
      expect(text(jaImperativeSegs(concept(HOZON_SURU), '1pl', false, true))).toBe('保存');
    });

    test('without a label derives the noun from the masu-stem, minus a する-verb’s し', () => {
      expect(jaImperativeSegs(concept(TABERU), '2sg', false, true)).toEqual([{ t: '食べ', r: 'たべ' }]);
      expect(jaImperativeSegs(concept(SESSHU_SURU), '2sg', false, true)).toEqual([{ t: '摂取', r: 'せっしゅ' }]);
    });

    test('a negative instruction keeps the prohibitive', () => {
      expect(text(jaImperativeSegs(concept(HOZON_SURU), '2sg', true, true))).toBe('保存するな');
    });
  });
});
