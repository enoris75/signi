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

  // A341: a determiner kept beside a possessive keeps its slot and the fusion; the possessive follows
  // the noun. "todas" stands in front of it.
  test('a determiner beside a possessive keeps its slot, the possessive following the noun', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(prepObjectText(np(CASA, {}, { possessor: my }), 'de')).toBe('da minha casa');
    expect(prepObjectText(np(CASA, { definiteness: 'this' }, { possessor: my }), 'de')).toBe('desta casa minha');
    expect(prepObjectText(np(CASA, { definiteness: 'indefinite' }, { possessor: my }), 'de')).toBe('de uma casa minha');
    expect(prepObjectText(np(CASA, { definiteness: 'all', number: 'plural' }, { possessor: my }), 'em')).toBe('em todas as minhas casas');
  });

  // A356: the numeral stands after the fused determiner and a possessive, before the noun; the one
  // beside a definite is left out (A319).
  test('a numeral follows the determiner and the possessive', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(prepObjectText(np(CASA, { number: 'plural', numeral: '2' }), 'de')).toBe('das duas casas');
    expect(prepObjectText(np(CASA, { definiteness: 'this', number: 'plural', numeral: '3' }), 'em')).toBe('nestas três casas');
    expect(prepObjectText(np(CASA, { number: 'plural', numeral: '2' }, { possessor: my }), 'de')).toBe('das minhas duas casas');
    expect(prepObjectText(np(CASA, { numeral: '1' }), 'em')).toBe('na casa');
  });

  test('a pronoun takes its tonic form, fused with em in the 3rd person', () => {
    expect(prepObjectText(np(EU), 'em')).toBe('em mim');
    expect(prepObjectText(np(VOCE), 'em')).toBe('em você');
    expect(prepObjectText(np(ELA), 'em')).toBe('nela');
    expect(prepObjectText(np(ELA), 'com')).toBe('com ela');
  });
});
