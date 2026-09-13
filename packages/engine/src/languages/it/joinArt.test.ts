import { describe, expect, test } from 'vitest';
import { joinArt } from './joinArt.js';

describe('joinArt', () => {
  test('a space after a full article or preposition', () => {
    expect(joinArt('il', 'gatto')).toBe('il gatto');
    expect(joinArt('tutte le', 'case')).toBe('tutte le case');
  });

  test('no space after an elided head', () => {
    expect(joinArt("l'", 'uomo')).toBe("l'uomo");
    expect(joinArt("dell'", 'acqua')).toBe("dell'acqua");
    expect(joinArt("tutta l'", 'acqua')).toBe("tutta l'acqua");
  });

  test('an empty head leaves the bare word', () => {
    expect(joinArt('', 'gatti')).toBe('gatti');
  });
});
