import { describe, expect, test } from 'vitest';
import { AGERU, concept, DESU, IKU, KURU, SHIRU, TABERU } from './ja.fixtures.js';
import { verbSeg } from './verbSeg.js';

describe('verbSeg', () => {
  test('the affirmative present is the stored ます form', () => {
    expect(verbSeg(concept(TABERU), false, 'present')).toEqual({ t: '食べます', r: 'たべます' });
    expect(verbSeg(concept(IKU), undefined, 'present')).toEqual({ t: '行きます', r: 'いきます' });
  });

  // Japanese has no future tense: the non-past covers it (C4).
  test('the future reuses the present', () => {
    expect(verbSeg(concept(TABERU), false, 'future')).toEqual({ t: '食べます', r: 'たべます' });
    expect(verbSeg(concept(TABERU), true, 'future')).toEqual({ t: '食べません', r: 'たべません' });
  });

  test('the negative present is the stem + ません', () => {
    expect(verbSeg(concept(IKU), true, 'present')).toEqual({ t: '行きません', r: 'いきません' });
  });

  test('the past is the stem + ました, negative ませんでした', () => {
    expect(verbSeg(concept(TABERU), false, 'past')).toEqual({ t: '食べました', r: 'たべました' });
    expect(verbSeg(concept(TABERU), true, 'past')).toEqual({ t: '食べませんでした', r: 'たべませんでした' });
  });

  test('the reading tracks the stem, not the dictionary form', () => {
    expect(verbSeg(concept(KURU), false, 'past')).toEqual({ t: '来ました', r: 'きました' });
    expect(verbSeg(concept(SHIRU), true, 'past')).toEqual({ t: '知りませんでした', r: 'しりませんでした' });
  });

  test('a kana verb with no reading takes no ruby', () => {
    expect(verbSeg(concept(AGERU), false, 'past')).toEqual({ t: 'あげました' });
  });

  test('a form with no ます stem is used as stored', () => {
    expect(verbSeg(concept(DESU), false, 'present')).toEqual({ t: 'です' });
  });
});
