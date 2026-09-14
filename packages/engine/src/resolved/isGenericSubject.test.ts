import { describe, expect, test } from 'vitest';
import { el, group, np } from '../languages/resolved.fixtures.js';
import { isGenericSubject } from './isGenericSubject.js';

const ONE = { person: '3', number: 'singular', base: 'one', generic: '1' };
const HE = { person: '3', number: 'singular', base: 'he' };

describe('isGenericSubject', () => {
  test('the generic pronoun alone in the slot', () => {
    expect(isGenericSubject(el(np(ONE)))).toBe(true);
  });

  test('an ordinary 3rd-person pronoun', () => {
    expect(isGenericSubject(el(np(HE)))).toBe(false);
  });

  test('a coordination is never the impersonal subject, even led by the generic pronoun', () => {
    expect(isGenericSubject(group('and', np(ONE), np(HE)))).toBe(false);
  });
});
