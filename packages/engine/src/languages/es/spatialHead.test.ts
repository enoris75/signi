import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, EUROPA, LIBRO, MERCADO, PERRO } from './es.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('in is en + whatever determiner the noun takes, never fused', () => {
    expect(spatialHead('in', false, CASA)).toBe('en la');
    expect(spatialHead('in', false, MERCADO)).toBe('en el');
    expect(spatialHead('in', false, { ...CASA, definiteness: 'indefinite' })).toBe('en una');
    expect(spatialHead('in', true, MERCADO)).toBe('en los');
    expect(spatialHead('in', false, { ...CASA, definiteness: 'bare' })).toBe('en');
  });

  test('the de-locutions fuse de with el only', () => {
    expect(spatialHead('under', false, LIBRO)).toBe('debajo del');
    expect(spatialHead('under', false, CASA)).toBe('debajo de la');
    expect(spatialHead('under', true, LIBRO)).toBe('debajo de los');
    expect(spatialHead('under', false, { ...CASA, definiteness: 'indefinite' })).toBe('debajo de una');
    expect(spatialHead('behind', false, { ...CASA, definiteness: 'this' })).toBe('detrás de esta');
  });

  test('each relation picks its locution', () => {
    expect(spatialHead('over', false, MERCADO)).toBe('por encima del');
    expect(spatialHead('around', false, CASA)).toBe('alrededor de la');
    expect(spatialHead('behind', false, PERRO)).toBe('detrás del');
    expect(spatialHead('in_front_of', false, CASA)).toBe('delante de la');
  });

  test('through is por, with a non-fusing article', () => {
    expect(spatialHead('through', false, CASA)).toBe('por la');
    expect(spatialHead('through', false, MERCADO)).toBe('por el');
    expect(spatialHead('through', false, { ...MERCADO, definiteness: 'indefinite' })).toBe('por un');
  });

  test('a stressed-a noun fuses as a masculine: debajo del agua', () => {
    expect(spatialHead('under', false, AGUA)).toBe('debajo del');
    expect(spatialHead('in', false, AGUA)).toBe('en el');
  });

  test('a proper name takes no article unless it is inherently articled', () => {
    expect(spatialHead('in', false, EUROPA)).toBe('en');
    expect(spatialHead('around', false, AFRICA)).toBe('alrededor de');
    expect(spatialHead('in', false, ANTARTIDA)).toBe('en la');
    expect(spatialHead('around', false, ANTARTIDA)).toBe('alrededor de la');
  });
});

// P09-E1.
describe('spatialHead: on, between, against', () => {
  test('on is sobre, never the en that in spells', () => {
    expect(spatialHead('on', false, CASA)).toBe('sobre la');
    expect(spatialHead('on', false, MERCADO)).toBe('sobre el');
    expect(spatialHead('on', false, { ...CASA, definiteness: 'indefinite' })).toBe('sobre una');
    expect(spatialHead('on', false, CASA)).not.toBe(spatialHead('in', false, CASA));
  });

  test('entre and contra contract with nothing', () => {
    expect(spatialHead('between', true, MERCADO)).toBe('entre los');
    expect(spatialHead('against', false, MERCADO)).toBe('contra el');
  });
});
