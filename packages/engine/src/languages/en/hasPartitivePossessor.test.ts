import { describe, expect, test } from 'vitest';
import { BOOK, CAT, np, STICK } from './en.fixtures.js';
import { hasPartitivePossessor } from './hasPartitivePossessor.js';

describe('hasPartitivePossessor', () => {
  test('a whole or the parts is partitive', () => {
    expect(hasPartitivePossessor(np(STICK, {}, { possessor: np(CAT), possessorRole: 'whole' }))).toBe(true);
    expect(hasPartitivePossessor(np(BOOK, {}, { possessor: np(CAT), possessorRole: 'parts' }))).toBe(true);
  });

  test('an owner is not, stated or by default', () => {
    expect(hasPartitivePossessor(np(BOOK, {}, { possessor: np(CAT), possessorRole: 'owner' }))).toBe(false);
    expect(hasPartitivePossessor(np(BOOK, {}, { possessor: np(CAT) }))).toBe(false);
  });

  test('the flag needs a genitive to stand on', () => {
    // No possessor at all, and a pronominal one, which stays the possessive pronoun ("its part").
    expect(hasPartitivePossessor(np(BOOK, {}, { possessorRole: 'whole' }))).toBe(false);
    expect(hasPartitivePossessor(np(BOOK, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'neut' }, possessorRole: 'whole' })))
      .toBe(false);
  });
});
