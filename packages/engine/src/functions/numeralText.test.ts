import { describe, expect, test } from 'vitest';
import type { CardinalTable } from './numeralWord.js';
import { numeralText } from './numeralText.js';

const IT: CardinalTable = { 1: { word: 'un', fem: 'una' }, 2: { word: 'due' } };

describe('numeralText', () => {
  test('reads the value off the forms and agrees it', () => {
    expect(numeralText({ numeral: '1', gender: 'fem' }, IT)).toBe('una');
    expect(numeralText({ numeral: '1' }, IT)).toBe('un');
    expect(numeralText({ numeral: '2', gender: 'fem' }, IT)).toBe('due');
  });

  test('a phrase that counts nothing writes nothing', () => {
    expect(numeralText({}, IT)).toBe('');
  });
});
