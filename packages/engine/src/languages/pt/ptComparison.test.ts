import { describe, expect, test } from 'vitest';
import { BOM, concept, GRANDE, MAU, PEQUENO, VELHO } from './pt.fixtures.js';
import { ptComparison } from './ptComparison.js';

describe('ptComparison', () => {
  test('a positive adjective is just agreed with the noun', () => {
    expect(ptComparison(concept(VELHO), 'fem', true)).toBe('velhas');
    expect(ptComparison(concept(BOM, 'GOOD'), 'fem', false)).toBe('boa');
  });

  test('a regular raised degree is periphrastic "mais" on the agreed base', () => {
    expect(ptComparison(concept({ ...VELHO, degree: 'more' }), 'fem', false)).toBe('mais velha');
    expect(ptComparison(concept({ ...VELHO, degree: 'most' }), 'masc', true)).toBe('mais velhos');
  });

  test('big / good / small / bad suppletise in the raised degrees', () => {
    expect(ptComparison(concept({ ...GRANDE, degree: 'more' }, 'BIG'), 'masc', false)).toBe('maior');
    expect(ptComparison(concept({ ...BOM, degree: 'most' }, 'GOOD'), 'fem', false)).toBe('melhor');
    expect(ptComparison(concept({ ...PEQUENO, degree: 'more' }, 'SMALL'), 'fem', false)).toBe('menor');
    expect(ptComparison(concept({ ...MAU, degree: 'more' }, 'BAD'), 'masc', false)).toBe('pior');
  });

  // A106: keyed by the Portuguese base, so GREAT ("grande") suppletises like BIG.
  test('any concept spelled grande suppletises', () => {
    expect(ptComparison(concept({ ...GRANDE, degree: 'more' }, 'GREAT'), 'masc', false)).toBe('maior');
    expect(ptComparison(concept({ ...GRANDE, degree: 'most' }, 'GREAT'), 'fem', true)).toBe('maiores');
    expect(ptComparison(concept({ ...GRANDE, degree: 'less' }, 'GREAT'), 'masc', false)).toBe('menos grande');
  });

  test('a suppletive is gender-invariant and pluralises in -es', () => {
    expect(ptComparison(concept({ ...GRANDE, degree: 'more' }, 'BIG'), 'fem', true)).toBe('maiores');
    expect(ptComparison(concept({ ...BOM, degree: 'more' }, 'GOOD'), 'masc', true)).toBe('melhores');
  });

  test('the lowered and equal degrees stay periphrastic even for a suppletive adjective', () => {
    expect(ptComparison(concept({ ...GRANDE, degree: 'less' }, 'BIG'), 'fem', true)).toBe('menos grandes');
    expect(ptComparison(concept({ ...BOM, degree: 'equally' }, 'GOOD'), 'fem', false)).toBe('igualmente boa');
    expect(ptComparison(concept({ ...MAU, degree: 'least' }, 'BAD'), 'fem', true)).toBe('menos más');
  });
});
