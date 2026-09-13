import { describe, expect, test } from 'vitest';
import { BELLO, BUONO, concept, GRANDE, PICCOLO } from './it.fixtures.js';
import { prenominalSurface } from './prenominalSurface.js';

describe('prenominalSurface', () => {
  test('BEAUTIFUL takes the article-like bello forms', () => {
    expect(prenominalSurface(concept(BELLO, 'BEAUTIFUL'), 'masc', false, 'uomo')).toBe("bell'");
    expect(prenominalSurface(concept(BELLO, 'BEAUTIFUL'), 'masc', true, 'gatti')).toBe('bei');
  });

  test('GOOD takes the apocopated buono forms', () => {
    expect(prenominalSurface(concept(BUONO, 'GOOD'), 'masc', false, 'cane')).toBe('buon');
    expect(prenominalSurface(concept(BUONO, 'GOOD'), 'fem', false, 'azione')).toBe("buon'");
  });

  test('any other adjective just agrees', () => {
    expect(prenominalSurface(concept(GRANDE, 'BIG'), 'masc', true, 'gatti')).toBe('grandi');
    expect(prenominalSurface(concept(PICCOLO, 'SMALL'), 'fem', false, 'casa')).toBe('piccola');
  });

  test('an adjective with no base yields nothing', () => {
    expect(prenominalSurface(concept({}, 'BIG'), 'masc', false, 'gatto')).toBe('');
  });
});
