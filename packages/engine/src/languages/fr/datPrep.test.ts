import { describe, expect, test } from 'vitest';
import { AFRIQUE, ANGE, CHAT, HOMME, MAISON } from './fr.fixtures.js';
import { datPrep } from './datPrep.js';

describe('datPrep', () => {
  test('à fuses with le and les', () => {
    expect(datPrep(CHAT)).toBe('au');
    expect(datPrep(CHAT, true)).toBe('aux');
    expect(datPrep(ANGE, true)).toBe('aux');
  });

  test('à stays apart from la and l’', () => {
    expect(datPrep(MAISON)).toBe('à la');
    expect(datPrep(ANGE)).toBe("à l'");
    expect(datPrep(HOMME)).toBe("à l'");
    expect(datPrep(AFRIQUE)).toBe("à l'");
  });

  test('the article is chosen on the word that follows', () => {
    expect(datPrep(HOMME, false, 'vieux')).toBe('au');
  });
});
