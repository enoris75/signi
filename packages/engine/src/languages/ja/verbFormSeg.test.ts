import { describe, expect, test } from 'vitest';
import { AGERU, concept, IKU, KURU, TABERU } from './ja.fixtures.js';
import { verbFormSeg } from './verbFormSeg.js';

describe('verbFormSeg', () => {
  test('the dictionary form, for 〜ことができる / 〜必要がある', () => {
    expect(verbFormSeg(concept(IKU), 'dict')).toEqual({ t: '行く', r: 'いく' });
    expect(verbFormSeg(concept(KURU), 'dict')).toEqual({ t: '来る', r: 'くる' });
  });

  test('the polite stem, for 〜たい', () => {
    expect(verbFormSeg(concept(IKU), 'stem')).toEqual({ t: '行き', r: 'いき' });
    expect(verbFormSeg(concept(TABERU), 'stem')).toEqual({ t: '食べ', r: 'たべ' });
    expect(verbFormSeg(concept(KURU), 'stem')).toEqual({ t: '来', r: 'き' });
  });

  test('a kana verb with no reading takes no ruby in either form', () => {
    expect(verbFormSeg(concept(AGERU), 'dict')).toEqual({ t: 'あげる' });
    expect(verbFormSeg(concept(AGERU), 'stem')).toEqual({ t: 'あげ' });
  });

  test('the stem falls back to the dictionary form when no ます form is stored', () => {
    expect(verbFormSeg(concept({ base: '行く', reading: 'いく' }), 'stem')).toEqual({ t: '行く', r: 'いく' });
  });
});
