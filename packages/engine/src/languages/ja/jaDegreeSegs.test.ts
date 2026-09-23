import { describe, expect, test } from 'vitest';
import { INU, OOKII, el, np } from './ja.fixtures.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');
const compared = (degree: string, extra: Record<string, string> = {}) =>
  np(OOKII, { degree, standard: '1', ...extra }, { standard: el(np(INU)) });

describe('jaDegreeSegs', () => {
  test('a standard takes the degree adverb\'s place, with the particle its degree selects', () => {
    expect(text(jaDegreeSegs(compared('more')))).toBe('犬より');
    expect(text(jaDegreeSegs(compared('less')))).toBe('犬ほど');
    expect(text(jaDegreeSegs(compared('equally')))).toBe('犬と同じくらい');
  });

  test('without a standard the degree adverb stands alone', () => {
    expect(text(jaDegreeSegs(np(OOKII, { degree: 'more' })))).toBe('もっと');
    expect(text(jaDegreeSegs(np(OOKII, { degree: 'less' })))).toBe('それほど');
    expect(text(jaDegreeSegs(np(OOKII)))).toBe('');
  });

  test('the standard leads the intensifier', () => {
    expect(text(jaDegreeSegs(compared('more', { intensifier: 'とても' })))).toBe('犬よりとても');
  });
});
