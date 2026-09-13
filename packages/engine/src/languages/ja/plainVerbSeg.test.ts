import { describe, expect, test } from 'vitest';
import { AGERU, concept, IKU, KURU, NAKU, NOMU, SHIRU, TABERU } from './ja.fixtures.js';
import { plainVerbSeg } from './plainVerbSeg.js';

describe('plainVerbSeg', () => {
  test('non-past is the dictionary form', () => {
    expect(plainVerbSeg(concept(TABERU), 'present')).toEqual({ t: '食べる', r: 'たべる' });
    expect(plainVerbSeg(concept(IKU), 'future')).toEqual({ t: '行く', r: 'いく' });
  });

  test('the past is the た-form, from the te-form て → た', () => {
    expect(plainVerbSeg(concept(TABERU), 'past')).toEqual({ t: '食べた', r: 'たべた' });
    expect(plainVerbSeg(concept(IKU), 'past')).toEqual({ t: '行った', r: 'いった' });
    expect(plainVerbSeg(concept(NAKU), 'past')).toEqual({ t: '泣いた', r: 'ないた' });
    expect(plainVerbSeg(concept(SHIRU), 'past')).toEqual({ t: '知った', r: 'しった' });
  });

  test('a voiced te-form で gives だ', () => {
    expect(plainVerbSeg(concept(NOMU), 'past')).toEqual({ t: '飲んだ', r: 'のんだ' });
  });

  test('the reading follows the te-form, not the dictionary form', () => {
    // 来る reads く, but 来た reads き.
    expect(plainVerbSeg(concept(KURU), 'present')).toEqual({ t: '来る', r: 'くる' });
    expect(plainVerbSeg(concept(KURU), 'past')).toEqual({ t: '来た', r: 'きた' });
  });

  test('a kana verb takes no ruby', () => {
    expect(plainVerbSeg(concept(AGERU), 'present')).toEqual({ t: 'あげる' });
    expect(plainVerbSeg(concept(AGERU), 'past')).toEqual({ t: 'あげた' });
  });
});
