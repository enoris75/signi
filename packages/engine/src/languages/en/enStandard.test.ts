import { describe, expect, test } from 'vitest';
import { ANIMAL, BIG, DOG, HOUSE, I, MAN, WE, el, np } from './en.fixtures.js';
import { enAdj } from './enAdj.js';
import { enStandard as render } from './enStandard.js';
import type { ResolvedNounPhrase } from '../../types.js';

/** The renderer reads the compared adjective and its standard; these tests build them as one phrase. */
const enStandard = (np: ResolvedNounPhrase) => render(np.head, np.standard);

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(DOG, the))) =>
  np(BIG, { degree, standard: '1' }, { standard });

describe('enStandard', () => {
  test('the comparatives take "than", the equative "as"', () => {
    expect(enStandard(compared('more'))).toBe('than the dog');
    expect(enStandard(compared('less'))).toBe('than the dog');
    expect(enStandard(compared('equally'))).toBe('as the dog');
  });

  test('the word is said once before a coordinated standard', () => {
    expect(enStandard(compared('more', el(np(DOG, the), np(MAN, the))))).toBe('than the dog and the man');
  });

  test('a pronoun standard takes its object form', () => {
    expect(enStandard(compared('more', el(np(I))))).toBe('than me');
  });

  test('nothing without a standard, or on a degree that takes none', () => {
    expect(enStandard(np(BIG, { degree: 'more' }))).toBe('');
    expect(enStandard(np(BIG, { degree: 'most' }, { standard: el(np(DOG, the)) }))).toBe('');
  });

  test('the equative adverb is "as" before a standard and "equally" without one', () => {
    expect(enAdj(compared('equally').head)).toBe('as big');
    expect(enAdj(np(BIG, { degree: 'equally' }).head)).toBe('equally big');
  });
});

describe('enStandard: a superlative\'s set (P09-E19)', () => {
  const selecting = (standard: ReturnType<typeof el>) => np(BIG, { degree: 'most', domain: '1' }, { standard });

  test('"of" before a plural, a coordinated or a pronoun set, "in" before a singular noun', () => {
    expect(enStandard(selecting(el(np(ANIMAL, { ...the, number: 'plural' }))))).toBe('of the animals');
    expect(enStandard(selecting(el(np(DOG, the), np(MAN, the))))).toBe('of the dog and the man');
    expect(enStandard(selecting(el(np(WE))))).toBe('of us');
    expect(enStandard(selecting(el(np(HOUSE, the))))).toBe('in the house');
  });
});
