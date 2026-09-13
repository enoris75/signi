import { describe, expect, test } from 'vitest';
import { AGERU, concept, DESU, HITSUYOU_GA_ARU, HOZON_SURU, IKU, KURU, TABERU } from './ja.fixtures.js';
import { masuStem } from './masuStem.js';

describe('masuStem', () => {
  test('strips ます from the polite present and its reading', () => {
    expect(masuStem(concept(TABERU))).toEqual({ stem: '食べ', reading: 'たべ' });
    expect(masuStem(concept(IKU))).toEqual({ stem: '行き', reading: 'いき' });
    expect(masuStem(concept(HOZON_SURU))).toEqual({ stem: '保存し', reading: 'ほぞんし' });
  });

  test('takes the stem reading from the ます form, not the dictionary form', () => {
    // 来る reads く, but its stem 来 reads き.
    expect(masuStem(concept(KURU))).toEqual({ stem: '来', reading: 'き' });
  });

  test('gives no reading when the ます form has none', () => {
    expect(masuStem(concept(AGERU))).toEqual({ stem: 'あげ', reading: undefined });
  });

  test('is null for a lexeme with no ます form', () => {
    expect(masuStem(concept(HITSUYOU_GA_ARU))).toBeNull();
    expect(masuStem(concept(DESU))).toBeNull();
  });
});
