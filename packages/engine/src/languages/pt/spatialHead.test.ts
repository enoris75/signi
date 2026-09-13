import { describe, expect, test } from 'vitest';
import { AFRICA, CASA, GATO, LIVRO } from './pt.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('"in" fuses em with the definite article', () => {
    expect(spatialHead('in', CASA, false)).toBe('na');
    expect(spatialHead('in', LIVRO, false)).toBe('no');
    expect(spatialHead('in', CASA, true)).toBe('nas');
  });

  test('"in" fuses with a demonstrative too, but with no other determiner', () => {
    expect(spatialHead('in', { ...CASA, definiteness: 'this' }, false)).toBe('nesta');
    expect(spatialHead('in', { ...LIVRO, definiteness: 'that' }, true)).toBe('nesses');
    expect(spatialHead('in', { ...CASA, definiteness: 'indefinite' }, false)).toBe('em uma');
    expect(spatialHead('in', { ...CASA, definiteness: 'no' }, false)).toBe('em nenhuma');
  });

  test('a proper name contracts with its fixed article', () => {
    expect(spatialHead('in', { ...AFRICA, definiteness: 'indefinite' }, false)).toBe('na');
  });

  test('the "de" locutions fuse de with the article', () => {
    expect(spatialHead('under', CASA, false)).toBe('debaixo da');
    expect(spatialHead('over', LIVRO, false)).toBe('por cima do');
    expect(spatialHead('around', CASA, false)).toBe('ao redor da');
    expect(spatialHead('behind', CASA, true)).toBe('atrás das');
    expect(spatialHead('in_front_of', GATO, false)).toBe('em frente do');
  });

  test('the "de" locutions fuse with a demonstrative and leave the rest uncontracted', () => {
    expect(spatialHead('under', { ...CASA, definiteness: 'indefinite' }, false)).toBe('debaixo de uma');
    expect(spatialHead('behind', { ...LIVRO, definiteness: 'this' }, false)).toBe('atrás deste');
    expect(spatialHead('around', { ...CASA, definiteness: 'some' }, true)).toBe('ao redor de algumas');
  });

  test('"through" is por, fusing to pelo/pela only with the definite article', () => {
    expect(spatialHead('through', LIVRO, false)).toBe('pelo');
    expect(spatialHead('through', CASA, true)).toBe('pelas');
    expect(spatialHead('through', { ...CASA, definiteness: 'indefinite' }, false)).toBe('por uma');
    expect(spatialHead('through', { ...CASA, definiteness: 'this' }, false)).toBe('por esta');
  });
});
