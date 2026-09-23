import { describe, expect, test } from 'vitest';
import { adj, BIG, CAT, DOG, el, np, OLD } from './en.fixtures.js';
import { npStandard } from './npStandard.js';
import { npText } from './npText.js';

const a = { definiteness: 'indefinite' };
const the = { definiteness: 'definite' };
const standard = el(np(DOG, the));
const compared = (degree: string, adjectives = [adj(BIG, { degree, standard: '1' })], index = 0) =>
  np(CAT, a, { adjectives, adjectiveStandard: { index, standard } });

describe('npStandard', () => {
  test('a comparative\'s standard follows the noun, the adjective staying before it', () => {
    expect(npStandard(compared('more'))).toBe('than the dog');
    expect(npText(compared('more'))).toBe('a bigger cat than the dog');
    expect(npText(compared('less'))).toBe('a less big cat than the dog');
  });

  test('an equative moves behind the noun with its standard, and the article agrees with the noun', () => {
    expect(npStandard(compared('equally'))).toBe('as big as the dog');
    expect(npText(compared('equally'))).toBe('a cat as big as the dog');
    expect(npText(compared('equally', [adj(OLD), adj(BIG, { degree: 'equally', standard: '1' })], 1))).toBe('an old cat as big as the dog');
  });

  test('nothing without one', () => {
    expect(npStandard(np(CAT, a, { adjectives: [adj(BIG, { degree: 'more' })] }))).toBe('');
  });
});
