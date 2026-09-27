import { describe, expect, test } from 'vitest';
import { joinArt } from './joinArt.js';

describe('joinArt', () => {
  test('a space after a whole article, none after an elided one', () => {
    expect(joinArt('il', 'giat')).toBe('il giat');
    expect(joinArt("l'", 'um')).toBe("l'um");
    expect(joinArt("da l'", 'aua')).toBe("da l'aua");
  });

  test('no article leaves the word bare', () => {
    expect(joinArt('', 'giats')).toBe('giats');
  });
});
