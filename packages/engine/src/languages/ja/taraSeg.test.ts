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

  // A118: the negative たら is built on the seeded plain negative.
  test('the negative turns the nai-form\'s い into かったら, falling back to the polite past', () => {
    expect(taraSeg(concept({ ...TABERU, nai: '食べない', nai_reading: 'たべない' }), true)).toEqual({ t: '食べなかったら', r: 'たべなかったら' });
    expect(taraSeg(concept({ ...KURU, nai: '来ない', nai_reading: 'こない' }), true)).toEqual({ t: '来なかったら', r: 'こなかったら' });
    expect(taraSeg(concept(TABERU), true)).toEqual({ t: '食べませんでしたら', r: 'たべませんでしたら' });
    expect(taraSeg(concept(AGERU), true)).toEqual({ t: 'あげませんでしたら' });
  });
});
