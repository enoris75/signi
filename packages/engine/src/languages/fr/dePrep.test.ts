import { describe, expect, test } from 'vitest';
import { ANGE, CHAT, EAU, HOMME, MAISON } from './fr.fixtures.js';
import { dePrep } from './dePrep.js';

describe('dePrep', () => {
  test('de fuses with le and les', () => {
    expect(dePrep(CHAT)).toBe('du');
    expect(dePrep(MAISON, true)).toBe('des');
  });

  test('de stays apart from la and l’', () => {
    expect(dePrep(MAISON)).toBe('de la');
    expect(dePrep(EAU)).toBe("de l'");
    expect(dePrep(HOMME)).toBe("de l'");
  });

  test('the article is chosen on the word that follows', () => {
    expect(dePrep(ANGE, false, 'petit')).toBe('du');
  });
});
