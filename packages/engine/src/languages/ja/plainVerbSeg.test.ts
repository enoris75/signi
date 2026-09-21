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

  test('with no te-form stored the past falls back to the dictionary form', () => {
    expect(plainVerbSeg(concept({ base: '食べる', reading: 'たべる' }), 'past')).toEqual({ t: '食べる', r: 'たべる' });
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

  // B13: the plain negative is the seeded nai-form; its past turns the final い into かった.
  describe('negative', () => {
    const TABENAI = concept({ ...TABERU, nai: '食べない', nai_reading: 'たべない' });
    const KONAI = concept({ ...KURU, nai: '来ない', nai_reading: 'こない' });

    test('non-past is the nai-form, future included', () => {
      expect(plainVerbSeg(TABENAI, 'present', true)).toEqual({ t: '食べない', r: 'たべない' });
      expect(plainVerbSeg(TABENAI, 'future', true)).toEqual({ t: '食べない', r: 'たべない' });
    });

    test('the past turns its い into かった', () => {
      expect(plainVerbSeg(TABENAI, 'past', true)).toEqual({ t: '食べなかった', r: 'たべなかった' });
      expect(plainVerbSeg(concept(SHIRU), 'past', true)).toEqual({ t: '知らなかった', r: 'しらなかった' });
    });

    test('the reading follows the nai-form: 来ない reads こ', () => {
      expect(plainVerbSeg(KONAI, 'present', true)).toEqual({ t: '来ない', r: 'こない' });
      expect(plainVerbSeg(KONAI, 'past', true)).toEqual({ t: '来なかった', r: 'こなかった' });
    });

    test('a kana nai-form takes no ruby', () => {
      expect(plainVerbSeg(concept({ ...AGERU, nai: 'あげない' }), 'past', true)).toEqual({ t: 'あげなかった' });
    });

    test('with no nai-form stored it falls back to the polite negative', () => {
      expect(plainVerbSeg(concept(TABERU), 'present', true)).toEqual({ t: '食べません', r: 'たべません' });
      expect(plainVerbSeg(concept(TABERU), 'past', true)).toEqual({ t: '食べませんでした', r: 'たべませんでした' });
    });

    test('regression: the affirmative ignores the nai-form', () => {
      expect(plainVerbSeg(TABENAI, 'present', false)).toEqual({ t: '食べる', r: 'たべる' });
      expect(plainVerbSeg(TABENAI, 'past')).toEqual({ t: '食べた', r: 'たべた' });
    });
  });
});
