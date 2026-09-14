import { describe, expect, test } from 'vitest';
import { CASA, ELA, EU, LIVRO, np, VOCE } from './pt.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  test('em contracts with the article and a demonstrative', () => {
    expect(prepObjectText(np(LIVRO), 'em')).toBe('no livro');
    expect(prepObjectText(np(CASA, { number: 'plural' }), 'em')).toBe('nas casas');
    expect(prepObjectText(np(CASA, { definiteness: 'this' }), 'em')).toBe('nesta casa');
  });

  test('any other determiner follows the plain preposition', () => {
    expect(prepObjectText(np(LIVRO, { definiteness: 'indefinite' }), 'em')).toBe('em um livro');
    expect(prepObjectText(np(CASA, { definiteness: 'no' }), 'em')).toBe('em nenhuma casa');
  });

  test('a pronoun takes its tonic form, fused with em in the 3rd person', () => {
    expect(prepObjectText(np(EU), 'em')).toBe('em mim');
    expect(prepObjectText(np(VOCE), 'em')).toBe('em você');
    expect(prepObjectText(np(ELA), 'em')).toBe('nela');
    expect(prepObjectText(np(ELA), 'com')).toBe('com ela');
  });
});
