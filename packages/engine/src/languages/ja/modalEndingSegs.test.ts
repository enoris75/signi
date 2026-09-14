import { describe, expect, test } from 'vitest';
import { concept, HITSUYOU_GA_ARU, KOTO_GA_DEKIRU, TAI } from './ja.fixtures.js';
import { modalEndingSegs } from './modalEndingSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('modalEndingSegs', () => {
  test('a verb-kind modal takes ます on its polite stem', () => {
    expect(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'present', false)).toEqual([
      { t: '必要があり', r: 'ひつようがあり' },
      { t: 'ます' },
    ]);
  });

  test('a verb-kind modal inflects for tense and polarity', () => {
    const can = concept(KOTO_GA_DEKIRU);
    expect(text(modalEndingSegs(can, 'present', true))).toBe('ことができません');
    expect(text(modalEndingSegs(can, 'past', false))).toBe('ことができました');
    expect(text(modalEndingSegs(can, 'past', true))).toBe('ことができませんでした');
    // Negated MUST is ¬obligation, "need not" (see A23).
    expect(text(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'present', true))).toBe('必要がありません');
  });

  test('〜たい inflects as an i-adjective, with polite です', () => {
    const want = concept(TAI);
    expect(modalEndingSegs(want, 'present', false)).toEqual([{ t: 'た' }, { t: 'いです' }]);
    expect(text(modalEndingSegs(want, 'present', true))).toBe('たくないです');
    expect(text(modalEndingSegs(want, 'past', false))).toBe('たかったです');
    expect(text(modalEndingSegs(want, 'past', true))).toBe('たくなかったです');
  });

  test('〜たい reuses the present for the future', () => {
    expect(text(modalEndingSegs(concept(TAI), 'future', false))).toBe('たいです');
  });

  // A116: the plain ending a prenominal relative clause needs.
  test('the plain ending: 〜ある is irregular, できる is ichidan, 〜たい drops です', () => {
    expect(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'past', false, 'plain')).toEqual([{ t: '必要が', r: 'ひつようが' }, { t: 'あった' }]);
    expect(text(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'present', true, 'plain'))).toBe('必要がない');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'present', false, 'plain'))).toBe('ことができる');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'present', true, 'plain'))).toBe('ことができない');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'past', false, 'plain'))).toBe('ことができた');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'past', true, 'plain'))).toBe('ことができなかった');
    expect(text(modalEndingSegs(concept(TAI), 'present', false, 'plain'))).toBe('たい');
    expect(text(modalEndingSegs(concept(TAI), 'past', true, 'plain'))).toBe('たくなかった');
  });

  // A118: the たら ending is the plain past + ら.
  test('the たら ending, which carries no tense', () => {
    expect(text(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'present', false, 'tara'))).toBe('必要があったら');
    expect(text(modalEndingSegs(concept(HITSUYOU_GA_ARU), 'past', true, 'tara'))).toBe('必要がなかったら');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'present', false, 'tara'))).toBe('ことができたら');
    expect(text(modalEndingSegs(concept(KOTO_GA_DEKIRU), 'present', true, 'tara'))).toBe('ことができなかったら');
    expect(text(modalEndingSegs(concept(TAI), 'present', false, 'tara'))).toBe('たかったら');
    expect(text(modalEndingSegs(concept(TAI), 'present', true, 'tara'))).toBe('たくなかったら');
  });
});
