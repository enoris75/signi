import { describe, expect, test } from 'vitest';
import { ER, GROSS, MANN, el, np } from './de.fixtures.js';
import { dePredAdj } from './dePredAdj.js';
import { deStandard } from './deStandard.js';

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(MANN, the))) =>
  np(GROSS, { degree, standard: '1' }, { standard });

describe('deStandard', () => {
  test('the comparatives take "als", the equative "wie", and the standard stays nominative', () => {
    expect(deStandard(compared('more'))).toBe('als der Mann');
    expect(deStandard(compared('less'))).toBe('als der Mann');
    expect(deStandard(compared('equally'))).toBe('wie der Mann');
  });

  test('a pronoun standard is nominative too, not the dative a preposition would give', () => {
    expect(deStandard(compared('more', el(np(ER))))).toBe('als er');
  });

  test('nothing without a standard', () => {
    expect(deStandard(np(GROSS, { degree: 'more' }))).toBe('');
  });

  test('the equative adverb is "so" before a standard and "gleich" without one', () => {
    expect(dePredAdj(compared('equally').head)).toBe('so groß');
    expect(dePredAdj(np(GROSS, { degree: 'equally' }).head)).toBe('gleich groß');
  });
});
