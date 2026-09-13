import { describe, expect, test } from 'vitest';
import { joinWords } from './joinWords.js';

describe('joinWords', () => {
  test('joins with single spaces', () => {
    expect(joinWords(['grande', 'vecchio', 'gatto'])).toBe('grande vecchio gatto');
  });

  test('no space after an elided word', () => {
    expect(joinWords(["bell'", 'uomo'])).toBe("bell'uomo");
    expect(joinWords(['grande', "bell'", 'uomo'])).toBe("grande bell'uomo");
  });

  test('drops empty words', () => {
    expect(joinWords(['', 'gatto', ''])).toBe('gatto');
    expect(joinWords([])).toBe('');
  });
});
