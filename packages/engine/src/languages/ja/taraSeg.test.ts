import { describe, expect, test } from 'vitest';
import { AGERU, concept, IKU, KURU, NOMU, TABERU } from './ja.fixtures.js';
import { taraSeg } from './taraSeg.js';

describe('taraSeg', () => {
  test('the te-form with て → たら', () => {
    expect(taraSeg(concept(TABERU))).toEqual({ t: '食べたら', r: 'たべたら' });
    expect(taraSeg(concept(IKU))).toEqual({ t: '行ったら', r: 'いったら' });
  });

  test('a voiced te-form で gives だら', () => {
    expect(taraSeg(concept(NOMU))).toEqual({ t: '飲んだら', r: 'のんだら' });
  });

  test('the reading follows the te-form, not the dictionary form', () => {
    expect(taraSeg(concept(KURU))).toEqual({ t: '来たら', r: 'きたら' });
  });

  test('a kana verb takes no ruby', () => {
    expect(taraSeg(concept(AGERU))).toEqual({ t: 'あげたら' });
  });
});
