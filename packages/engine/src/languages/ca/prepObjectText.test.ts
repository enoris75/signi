import { describe, expect, test } from 'vitest';
import { BOTO, CASA, GAT, HOME, JO, np } from './ca.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  test('a and de contract with the article, other prepositions lead it', () => {
    expect(prepObjectText(np(BOTO), 'a')).toBe('al botó');
    expect(prepObjectText(np(HOME), 'a')).toBe("a l'home");
    expect(prepObjectText(np(CASA), 'de')).toBe('de la casa');
    expect(prepObjectText(np(GAT), 'amb')).toBe('amb el gat');
  });

  test('a pronoun takes its tonic form', () => {
    expect(prepObjectText(np(JO), 'de')).toBe('de mi');
  });

  test('a possessed noun is a whole noun phrase after it', () => {
    expect(prepObjectText(np(CASA, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), 'a')).toBe('a la meva casa');
  });
});
