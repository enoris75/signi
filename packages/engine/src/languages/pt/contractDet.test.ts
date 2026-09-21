import { describe, expect, test } from 'vitest';
import { AFRICA, CASA, EUROPA, GATO, JAPAO, LIVRO, PORTUGAL, TEMPO } from './pt.fixtures.js';
import { contractDet } from './contractDet.js';
import { datPrep } from './datPrep.js';
import { dePrep } from './dePrep.js';
import { emPrep } from './emPrep.js';
import { porPrep } from './porPrep.js';

describe('contractDet', () => {
  test('the definite article fuses with the preposition', () => {
    expect(contractDet(emPrep, 'em', CASA)).toBe('na');
    expect(contractDet(dePrep, 'de', { ...GATO, definiteness: 'definite' }, true)).toBe('dos');
    expect(contractDet(datPrep, 'a', CASA, true)).toBe('às');
    expect(contractDet(porPrep, 'por', LIVRO)).toBe('pelo');
  });

  test('em and de fuse with a demonstrative too', () => {
    expect(contractDet(emPrep, 'em', { ...CASA, definiteness: 'this' })).toBe('nesta');
    expect(contractDet(emPrep, 'em', { ...LIVRO, definiteness: 'that' }, true)).toBe('nesses');
    expect(contractDet(dePrep, 'de', { ...GATO, definiteness: 'this' })).toBe('deste');
    expect(contractDet(dePrep, 'de', { ...CASA, definiteness: 'that' }, true)).toBe('dessas');
  });

  test('a and por keep a demonstrative apart', () => {
    expect(contractDet(datPrep, 'a', { ...CASA, definiteness: 'this' })).toBe('a esta');
    expect(contractDet(porPrep, 'por', { ...LIVRO, definiteness: 'that' })).toBe('por esse');
  });

  test('any other determiner rides after the plain preposition', () => {
    expect(contractDet(datPrep, 'a', { ...CASA, definiteness: 'indefinite' })).toBe('a uma');
    expect(contractDet(dePrep, 'de', { ...CASA, definiteness: 'many' }, true)).toBe('de muitas');
    expect(contractDet(emPrep, 'em', { ...CASA, definiteness: 'no' })).toBe('em nenhuma');
    expect(contractDet(datPrep, 'a', { ...TEMPO, definiteness: 'all' }, true)).toBe('a todos os');
  });

  test('a bare noun takes the plain preposition', () => {
    expect(contractDet(emPrep, 'em', { ...CASA, definiteness: 'bare' })).toBe('em');
  });

  test('a proper noun contracts with its article whatever was picked', () => {
    expect(contractDet(emPrep, 'em', AFRICA)).toBe('na');
    expect(contractDet(dePrep, 'de', { ...EUROPA, definiteness: 'this' })).toBe('da');
    expect(contractDet(datPrep, 'a', { ...AFRICA, definiteness: 'indefinite' })).toBe('à');
    expect(contractDet(dePrep, 'de', JAPAO)).toBe('do');
  });

  test('a bare name takes the plain preposition, whatever was picked', () => {
    expect(contractDet(dePrep, 'de', PORTUGAL)).toBe('de');
    expect(contractDet(emPrep, 'em', { ...PORTUGAL, definiteness: 'this' })).toBe('em');
    expect(contractDet(datPrep, 'a', PORTUGAL)).toBe('a');
    expect(contractDet(porPrep, 'por', { ...PORTUGAL, definiteness: 'indefinite' })).toBe('por');
  });
});
