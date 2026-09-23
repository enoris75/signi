import { describe, expect, test } from 'vitest';
import { BIG, DOG, I, MAN, el, np } from './en.fixtures.js';
import { enAdj } from './enAdj.js';
import { enStandard } from './enStandard.js';

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
