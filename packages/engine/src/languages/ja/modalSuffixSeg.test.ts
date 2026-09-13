import { describe, expect, test } from 'vitest';
import { concept, HITSUYOU_GA_ARU, KOTO_GA_DEKIRU, TAI } from './ja.fixtures.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';

describe('modalSuffixSeg', () => {
  test('the dictionary shape, with its reading', () => {
    expect(modalSuffixSeg(concept(HITSUYOU_GA_ARU), 'dict')).toEqual({ t: '必要がある', r: 'ひつようがある' });
    expect(modalSuffixSeg(concept(TAI), 'dict')).toEqual({ t: 'たい' });
  });

  test('the polite-stem shape, with its reading', () => {
    expect(modalSuffixSeg(concept(HITSUYOU_GA_ARU), 'stem')).toEqual({ t: '必要があり', r: 'ひつようがあり' });
  });

  test('an all-kana suffix takes no ruby', () => {
    expect(modalSuffixSeg(concept(KOTO_GA_DEKIRU), 'dict')).toEqual({ t: 'ことができる' });
    expect(modalSuffixSeg(concept(KOTO_GA_DEKIRU), 'stem')).toEqual({ t: 'ことができ' });
  });
});
