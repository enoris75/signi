import { describe, expect, test } from 'vitest';
import { HOMME, IL, JE, LIVRE, MAISON, np } from './fr.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  // A pronoun takes its tonic form, and "de" elides before a vowel.
  test('a pronoun is the tonic form, de elided before a vowel', () => {
    expect(prepObjectText(np(IL), 'sur')).toBe('sur lui');
    // The resolved feminine tonic, as the translator hands it over.
    expect(prepObjectText(np({ base: 'elle', person: '3', number: 'singular', gender: 'fem', disjunctive: 'elle' }), 'de')).toBe("d'elle");
    expect(prepObjectText(np(IL), 'de')).toBe('de lui');
  });

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

  test('a bare object takes the indefinite or partitive article after the preposition (A149)', () => {
    expect(prepObjectText(np(MAISON, { definiteness: 'bare', number: 'plural' }), 'sur')).toBe('sur des maisons');
    expect(prepObjectText(np(LIVRE, { definiteness: 'bare' }), 'sur')).toBe('sur du livre');
  });

  test('a possessive stands in for the article', () => {
    expect(prepObjectText(np(LIVRE, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), 'sur')).toBe('sur mon livre');
  });

  test('a pronoun takes its tonic form', () => {
    expect(prepObjectText(np(JE), 'sur')).toBe('sur moi');
    expect(prepObjectText(np(IL), 'sur')).toBe('sur lui');
  });
});
