import { describe, expect, test } from 'vitest';
import { CASA, EUROPA, MERCATO, UOMO } from './it.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('in fuses with the definite article only', () => {
    expect(spatialHead('in', CASA, false, 'casa')).toBe('nella');
    expect(spatialHead('in', MERCATO, true, 'mercati')).toBe('nei');
    expect(spatialHead('in', { ...CASA, definiteness: 'indefinite' }, false, 'casa')).toBe('in una');
    expect(spatialHead('in', { ...CASA, definiteness: 'no' }, false, 'casa')).toBe('in nessuna');
    expect(spatialHead('in', { ...CASA, definiteness: 'bare' }, false, 'casa')).toBe('in');
  });

  test('sotto, sopra, dietro and attraverso take a plain, unfused determiner', () => {
    expect(spatialHead('under', CASA, false, 'casa')).toBe('sotto la');
    expect(spatialHead('over', MERCATO, false, 'mercato')).toBe('sopra il');
    expect(spatialHead('behind', UOMO, false, 'uomo')).toBe("dietro l'");
    expect(spatialHead('through', MERCATO, true, 'mercati')).toBe('attraverso i');
    expect(spatialHead('under', { ...CASA, definiteness: 'indefinite' }, false, 'casa')).toBe('sotto una');
    expect(spatialHead('behind', { ...CASA, definiteness: 'bare' }, false, 'casa')).toBe('dietro');
  });

  test('intorno and davanti govern a, which fuses only with the definite article', () => {
    expect(spatialHead('around', MERCATO, false, 'mercato')).toBe('intorno al');
    expect(spatialHead('in_front_of', CASA, false, 'casa')).toBe('davanti alla');
    expect(spatialHead('in_front_of', UOMO, false, 'uomo')).toBe("davanti all'");
    expect(spatialHead('around', { ...MERCATO, definiteness: 'indefinite' }, false, 'mercato')).toBe('intorno a un');
    expect(spatialHead('around', { ...CASA, definiteness: 'all' }, true, 'case')).toBe('intorno a tutte le');
  });

  test('a proper noun keeps its article under a relation', () => {
    expect(spatialHead('under', EUROPA, false, 'Europa')).toBe("sotto l'");
  });
});

// P09-E1.
describe('spatialHead: on, between, against', () => {
  test('su fuses as in does, apart from over\'s sopra', () => {
    expect(spatialHead('on', MERCATO, false, 'mercato')).toBe('sul');
    expect(spatialHead('on', CASA, false, 'casa')).toBe('sulla');
    expect(spatialHead('on', { ...CASA, definiteness: 'indefinite' }, false, 'casa')).toBe('su una');
    expect(spatialHead('over', CASA, false, 'casa')).toBe('sopra la');
  });

  test('tra and contro take a plain article', () => {
    expect(spatialHead('between', CASA, false, 'casa')).toBe('tra la');
    expect(spatialHead('between', UOMO, false, 'uomo')).toBe("tra l'");
    expect(spatialHead('against', MERCATO, false, 'mercato')).toBe('contro il');
    expect(spatialHead('against', { ...CASA, definiteness: 'bare' }, false, 'casa')).toBe('contro');
  });
});

// P09-E32: `among` is `between`'s "tra" in Italian, a deliberate merger.
describe('spatialHead: among', () => {
  test('is tra with a plain article, as between', () => {
    expect(spatialHead('among', CASA, true, 'case')).toBe(spatialHead('between', CASA, true, 'case'));
    expect(spatialHead('among', CASA, false, 'casa')).toBe('tra la');
  });
});
