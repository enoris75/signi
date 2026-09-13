import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { coordinate } from './coordinate.js';
import { CAT, DOG, el, FOX, group, MOUSE, np } from './en.fixtures.js';
import { npText } from './npText.js';

const base = (phrase: ResolvedNounPhrase) => phrase.head.forms['base'] ?? '';

describe('coordinate', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinate(el(np(CAT)), base)).toBe('cat');
  });

  test('joins two conjuncts with and', () => {
    expect(coordinate(el(np(CAT), np(DOG)), base)).toBe('cat and dog');
  });

  test('puts commas between all but the last pair, with no serial comma', () => {
    expect(coordinate(el(np(CAT), np(DOG), np(MOUSE)), base)).toBe('cat, dog and mouse');
    expect(coordinate(el(np(CAT), np(DOG), np(MOUSE), np(FOX)), base)).toBe('cat, dog, mouse and fox');
  });

  test('joins with or for a disjunction', () => {
    expect(coordinate(group('or', np(CAT), np(DOG), np(MOUSE)), base)).toBe('cat, dog or mouse');
  });

  test('defaults to and when the slot names no conjunction', () => {
    expect(coordinate({ conjuncts: [np(CAT), np(DOG)], agreement: {} }, base)).toBe('cat and dog');
  });

  test('renders each conjunct through the given renderer', () => {
    expect(coordinate(group('or', np(CAT), np(DOG, { number: 'plural' })), npText)).toBe('the cat or the dogs');
  });

  test('drops a conjunct that renders empty', () => {
    const slot = el(np(CAT), np(DOG), np(MOUSE));
    expect(coordinate(slot, (phrase) => (phrase.head.forms['base'] === 'dog' ? '' : base(phrase)))).toBe('cat and mouse');
  });
});
