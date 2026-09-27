import { describe, expect, test } from 'vitest';
import { joinWords } from './joinWords.js';

describe('joinWords', () => {
  test('joins with spaces, dropping empty words', () => {
    expect(joinWords(['in', '', 'grond', 'giat'])).toBe('in grond giat');
    expect(joinWords([])).toBe('');
  });

  test('no space after an elided word', () => {
    expect(joinWords(["l'", 'auter', 'giat'])).toBe("l'auter giat");
    expect(joinWords(['cun', "l'", 'um'])).toBe("cun l'um");
  });
});
