import { describe, expect, test } from 'vitest';
import { el, group, np } from '../languages/resolved.fixtures.js';
import { firstConjunct } from './firstConjunct.js';

const CAT = { base: 'cat' };
const DOG = { base: 'dog' };

describe('firstConjunct', () => {
  test('a single-phrase slot gives that phrase', () => {
    const cat = np(CAT);
    expect(firstConjunct(el(cat))).toBe(cat);
  });

  test('a coordinated slot gives its first conjunct', () => {
    const cat = np(CAT);
    expect(firstConjunct(group('or', cat, np(DOG)))).toBe(cat);
  });
});
