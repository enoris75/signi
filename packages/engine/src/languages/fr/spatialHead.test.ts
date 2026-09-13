import { describe, expect, test } from 'vitest';
import { ANGE, LIVRE, MAISON, MARCHE } from './fr.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('dans, sous, derrière, devant and à travers take a plain article', () => {
    expect(spatialHead('in', MAISON, false, 'maison')).toBe('dans la');
    expect(spatialHead('under', LIVRE, false, 'livre')).toBe('sous le');
    expect(spatialHead('behind', MAISON, true, 'maisons')).toBe('derrière les');
    expect(spatialHead('in_front_of', ANGE, false, 'ange')).toBe("devant l'");
    expect(spatialHead('through', MARCHE, false, 'marché')).toBe('à travers le');
  });

  test('those prepositions carry any other determiner as it is', () => {
    expect(spatialHead('in', { ...MAISON, definiteness: 'indefinite' }, false, 'maison')).toBe('dans une');
    expect(spatialHead('under', { ...MAISON, definiteness: 'no' }, false, 'maison')).toBe('sous aucune');
    expect(spatialHead('through', { ...MAISON, definiteness: 'bare' }, false, 'maison')).toBe('à travers');
  });

  test('au-dessus and autour govern de, fused with the definite article', () => {
    expect(spatialHead('over', MAISON, false, 'maison')).toBe('au-dessus de la');
    expect(spatialHead('over', MARCHE, false, 'marché')).toBe('au-dessus du');
    expect(spatialHead('around', MAISON, true, 'maisons')).toBe('autour des');
    expect(spatialHead('around', ANGE, false, 'ange')).toBe("autour de l'");
  });

  test('before another determiner de elides, and the plural indefinite drops', () => {
    expect(spatialHead('around', { ...MAISON, definiteness: 'indefinite' }, false, 'maison')).toBe("autour d'une");
    expect(spatialHead('over', { ...MAISON, definiteness: 'indefinite' }, true, 'maisons')).toBe('au-dessus de');
    expect(spatialHead('over', { ...MAISON, definiteness: 'some' }, true, 'maisons')).toBe('au-dessus de quelques');
  });
});
