import { describe, expect, test } from 'vitest';
import { concept, KURU, NOMU, TABERU } from './ja.fixtures.js';
import { aspectFormSegs } from './aspectFormSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');
const TABENAI = concept({ ...TABERU, nai: '食べない', nai_reading: 'たべない' });

// B07: an aspect in the form a modal governs.
describe('aspectFormSegs', () => {
  test('the progressive is the te-form + いる, or the stem い under 〜たい', () => {
    expect(aspectFormSegs(concept(TABERU), 'progressive', 'dict')).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'いる' }]);
    expect(aspectFormSegs(concept(TABERU), 'progressive', 'stem')).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'い' }]);
    expect(text(aspectFormSegs(concept(NOMU), 'progressive', 'dict'))).toBe('飲んでいる');
  });

  test('the resultative is the resultant state 〜ている as well', () => {
    expect(text(aspectFormSegs(concept(TABERU), 'resultative', 'dict'))).toBe('食べている');
    expect(text(aspectFormSegs(concept(TABERU), 'resultative', 'stem'))).toBe('食べてい');
  });

  test('the prospective is 〜ようとしている on the volitional', () => {
    expect(aspectFormSegs(TABENAI, 'prospective', 'dict')).toEqual([{ t: '食べよう', r: 'たべよう' }, { t: 'として' }, { t: 'いる' }]);
    expect(text(aspectFormSegs(TABENAI, 'prospective', 'stem'))).toBe('食べようとしてい');
    expect(aspectFormSegs(concept({ ...KURU, nai: '来ない', nai_reading: 'こない' }), 'prospective', 'dict')[0]).toEqual({ t: '来よう', r: 'こよう' });
  });

  test('with no nai-form, the prospective takes ところ and the copula in the governed form', () => {
    expect(text(aspectFormSegs(concept(TABERU), 'prospective', 'dict'))).toBe('食べるところである');
    expect(text(aspectFormSegs(concept(TABERU), 'prospective', 'stem'))).toBe('食べるところであり');
  });

  // A03: a modal can deny the group it governs, and the aspect's own auxiliary carries that ない —
  // through the 〜ないでい bridge under a stem governor, as every other governed element does.
  test('the aspect the modal denies takes the ない form on its auxiliary', () => {
    expect(aspectFormSegs(concept(TABERU), 'progressive', 'dict', true)).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'いない' }]);
    expect(text(aspectFormSegs(concept(TABERU), 'progressive', 'stem', true))).toBe('食べていないでい');
    expect(text(aspectFormSegs(concept(TABERU), 'resultative', 'dict', true))).toBe('食べていない');
    expect(text(aspectFormSegs(TABENAI, 'prospective', 'dict', true))).toBe('食べようとしていない');
    expect(text(aspectFormSegs(concept(TABERU), 'prospective', 'dict', true))).toBe('食べるところでない');
    expect(text(aspectFormSegs(concept(TABERU), 'prospective', 'stem', true))).toBe('食べるところでないでい');
  });
});
