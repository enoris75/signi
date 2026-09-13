import { describe, expect, test } from 'vitest';
import { CHAT, EFFONDRER, JE, MANGER, TU } from './fr.fixtures.js';
import { reflexiveInfinitive } from './reflexiveInfinitive.js';

describe('reflexiveInfinitive', () => {
  test('the reflexive clitic agrees with the subject, eliding before a vowel', () => {
    expect(reflexiveInfinitive(EFFONDRER, JE)).toBe("m'effondrer");
    expect(reflexiveInfinitive(EFFONDRER, TU)).toBe("t'effondrer");
    expect(reflexiveInfinitive(EFFONDRER, { ...JE, number: 'plural' })).toBe('nous effondrer');
    expect(reflexiveInfinitive(EFFONDRER, CHAT)).toBe("s'effondrer");
  });

  test('a non-reflexive verb keeps its base', () => {
    expect(reflexiveInfinitive(MANGER, JE)).toBe('manger');
  });
});
