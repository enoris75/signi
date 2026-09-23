import { describe, expect, test } from 'vitest';
import { INU, OOKII, el, np } from './ja.fixtures.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';

/** The segments lead a compared adjective with its standard; these tests build them as one phrase. */
const degreeSegs = (np: ResolvedNounPhrase) => jaDegreeSegs(np.head, np.standard);

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');
const compared = (degree: string, extra: Record<string, string> = {}) =>
  np(OOKII, { degree, standard: '1', ...extra }, { standard: el(np(INU)) });

describe('jaDegreeSegs', () => {
  test('a standard takes the degree adverb\'s place, with the particle its degree selects', () => {
    expect(text(degreeSegs(compared('more')))).toBe('犬より');
    expect(text(degreeSegs(compared('less')))).toBe('犬ほど');
    expect(text(degreeSegs(compared('equally')))).toBe('犬と同じくらい');
  });

  test('without a standard the degree adverb stands alone', () => {
    expect(text(degreeSegs(np(OOKII, { degree: 'more' })))).toBe('もっと');
    expect(text(degreeSegs(np(OOKII, { degree: 'less' })))).toBe('それほど');
    expect(text(degreeSegs(np(OOKII)))).toBe('');
  });

  test('the standard leads the intensifier', () => {
    expect(text(degreeSegs(compared('more', { intensifier: 'とても' })))).toBe('犬よりとても');
  });
});

describe('jaDegreeSegs: a superlative\'s set (P09-E19)', () => {
  test('の中で, and the degree adverb stays', () => {
    const selecting = (degree: string) => np(OOKII, { degree, domain: '1' }, { standard: el(np(INU)) });
    expect(text(degreeSegs(selecting('most')))).toBe('犬の中で最も');
    expect(text(degreeSegs(selecting('least')))).toBe('犬の中で最も');
  });
});
