import { describe, expect, test } from 'vitest';
import { AFRICA, AIGUA, CASA, EUROPA, GAT } from './ca.fixtures.js';
import { artFor } from './artFor.js';

describe('artFor', () => {
  test('defaults to the definite article', () => {
    expect(artFor(GAT)).toBe('el');
    expect(artFor(CASA, true)).toBe('les');
  });

  test('indefinite, bare and the demonstratives', () => {
    expect(artFor({ ...GAT, definiteness: 'indefinite' })).toBe('un');
    expect(artFor({ ...CASA, definiteness: 'indefinite' }, true)).toBe('unes');
    expect(artFor({ ...GAT, definiteness: 'bare' }, true)).toBe('');
    expect(artFor({ ...CASA, definiteness: 'this' })).toBe('aquesta');
    expect(artFor({ ...GAT, definiteness: 'that' }, true)).toBe('aquells');
  });

  test('the quantifiers agree in gender', () => {
    expect(artFor({ ...GAT, definiteness: 'some' }, true)).toBe('alguns');
    expect(artFor({ ...CASA, definiteness: 'some' }, true)).toBe('algunes');
    expect(artFor({ ...GAT, definiteness: 'many' }, true)).toBe('molts');
    expect(artFor({ ...CASA, definiteness: 'few' }, true)).toBe('poques');
    expect(artFor({ ...GAT, definiteness: 'all' }, true)).toBe('tots els');
    expect(artFor({ ...CASA, definiteness: 'all' }, true)).toBe('totes les');
    expect(artFor({ ...CASA, definiteness: 'both' }, true)).toBe('totes dues');
    expect(artFor({ ...GAT, definiteness: 'several' }, true)).toBe('diversos');
    expect(artFor({ ...GAT, definiteness: 'most' }, true)).toBe('la majoria de els');
  });

  test('no is the invariable, singular cap', () => {
    expect(artFor({ ...GAT, definiteness: 'no' })).toBe('cap');
    expect(artFor({ ...CASA, definiteness: 'no' })).toBe('cap');
  });

  test('each, every, enough and such', () => {
    expect(artFor({ ...GAT, definiteness: 'each' })).toBe('cada');
    expect(artFor({ ...GAT, definiteness: 'every' })).toBe('cada');
    expect(artFor({ ...GAT, definiteness: 'enough' }, true)).toBe('prou');
    expect(artFor({ ...GAT, definiteness: 'such' }, true)).toBe('tals');
  });

  test('a mass noun takes no indefinite article and its own quantifiers', () => {
    expect(artFor(AIGUA)).toBe('la');
    expect(artFor({ ...AIGUA, definiteness: 'indefinite' })).toBe('');
    expect(artFor({ ...AIGUA, definiteness: 'some' })).toBe('una mica de');
    expect(artFor({ ...AIGUA, definiteness: 'many' })).toBe('molta');
    expect(artFor({ ...AIGUA, definiteness: 'all' })).toBe('tota la');
    expect(artFor({ ...AIGUA, definiteness: 'no' })).toBe('gens de');
    expect(artFor({ ...AIGUA, definiteness: 'most' })).toBe('la major part de la');
  });

  test('a place name goes bare unless its lexeme takes the article', () => {
    expect(artFor(EUROPA)).toBe('');
    expect(artFor(AFRICA)).toBe('la');
  });

  test('an approximator stands before the determiner', () => {
    expect(artFor({ ...GAT, definiteness: 'all', approximator_det: 'gairebé ' }, true)).toBe('gairebé tots els');
  });
});
