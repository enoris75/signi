import { describe, expect, test } from 'vitest';
import { numeralDe } from './numeralDe.js';

const HUND = { base: 'Hund', gender: 'masc', numeral: '1' };
const STUNDE = { base: 'Stunde', gender: 'fem', numeral: '1' };

describe('numeralDe', () => {
  test('one after der or dieser declines weak, by case and gender', () => {
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'nom', 'definite', false)).toBe('eine');
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'acc', 'definite', false)).toBe('einen');
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'dat', 'definite', false)).toBe('einen');
    expect(numeralDe({ ...STUNDE, definiteness: 'definite' }, 'gen', 'definite', false)).toBe('einen');
    expect(numeralDe({ ...HUND, definiteness: 'this' }, 'nom', 'this', false)).toBe('eine');
  });

  test('any other count is the cardinal table\'s word', () => {
    expect(numeralDe({ ...HUND, numeral: '2', definiteness: 'definite' }, 'acc', 'definite', false)).toBe('zwei');
    expect(numeralDe({ ...HUND, definiteness: 'bare' }, 'nom', 'bare', false)).toBe('ein');
    // After wessen, which declines nothing, the one is left as it is.
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'nom', 'bare', true)).toBe('ein');
  });

  // A357: a possessive in the definite's place is an ein-word, and one takes the mixed ending after it.
  test('one after a possessive takes the mixed ending', () => {
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'nom', 'no', false)).toBe('einer');
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'acc', 'no', false)).toBe('einen');
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'gen', 'no', false)).toBe('einen');
    expect(numeralDe({ ...HUND, definiteness: 'definite' }, 'dat', 'no', false)).toBe('einen');
    expect(numeralDe({ ...STUNDE, definiteness: 'definite' }, 'nom', 'no', false)).toBe('eine');
  });
});
