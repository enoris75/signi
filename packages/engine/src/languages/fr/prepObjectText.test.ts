import { describe, expect, test } from 'vitest';
import { HOMME, IL, JE, LIVRE, MAISON, np } from './fr.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  test('the preposition leads the noun phrase with its own determiner', () => {
    expect(prepObjectText(np(LIVRE), 'sur')).toBe('sur le livre');
    expect(prepObjectText(np(HOMME), 'sur')).toBe("sur l'homme");
    expect(prepObjectText(np(MAISON, { definiteness: 'indefinite' }), 'sur')).toBe('sur une maison');
    expect(prepObjectText(np(MAISON, { number: 'plural' }), 'sur')).toBe('sur les maisons');
  });

  test('à and de fuse with the definite article', () => {
    expect(prepObjectText(np(LIVRE), 'à')).toBe('au livre');
    expect(prepObjectText(np(LIVRE, { number: 'plural' }), 'de')).toBe('des livres');
  });

  test('a pronoun takes its tonic form', () => {
    expect(prepObjectText(np(JE), 'sur')).toBe('sur moi');
    expect(prepObjectText(np(IL), 'sur')).toBe('sur lui');
  });
});
