import { describe, expect, test } from 'vitest';
import { concept, MOTSU, TABERU } from './ja.fixtures.js';
import { isPossessiveExistential } from './isPossessiveExistential.js';

describe('isPossessiveExistential', () => {
  test('HAVE with an inanimate owner is the existential', () => {
    expect(isPossessiveExistential(concept(MOTSU), false)).toBe(true);
  });

  test('an animate owner holds what it has', () => {
    expect(isPossessiveExistential(concept(MOTSU), true)).toBe(false);
  });

  test('a verb not marked for it never is', () => {
    expect(isPossessiveExistential(concept(TABERU), false)).toBe(false);
  });
});
