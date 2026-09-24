import { describe, expect, test } from 'vitest';
import { ANGE, LIVRE, MAISON, MARCHE } from './fr.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('dans, sous, derrière, devant and à travers take a plain article', () => {
    expect(spatialHead('in', MAISON, false, 'maison', 'locative')).toBe('dans la');
    expect(spatialHead('under', LIVRE, false, 'livre', 'locative')).toBe('sous le');
    expect(spatialHead('behind', MAISON, true, 'maisons', 'locative')).toBe('derrière les');
    expect(spatialHead('in_front_of', ANGE, false, 'ange', 'locative')).toBe("devant l'");
    expect(spatialHead('through', MARCHE, false, 'marché', 'locative')).toBe('à travers le');
  });

  test('those prepositions carry any other determiner as it is', () => {
    expect(spatialHead('in', { ...MAISON, definiteness: 'indefinite' }, false, 'maison', 'locative')).toBe('dans une');
    expect(spatialHead('under', { ...MAISON, definiteness: 'no' }, false, 'maison', 'locative')).toBe('sous aucune');
    expect(spatialHead('through', { ...MAISON, definiteness: 'bare' }, false, 'maison', 'locative')).toBe('à travers');
  });

  test('au-dessus and autour govern de, fused with the definite article', () => {
    expect(spatialHead('over', MAISON, false, 'maison', 'locative')).toBe('au-dessus de la');
    expect(spatialHead('over', MARCHE, false, 'marché', 'locative')).toBe('au-dessus du');
    expect(spatialHead('around', MAISON, true, 'maisons', 'locative')).toBe('autour des');
    expect(spatialHead('around', ANGE, false, 'ange', 'locative')).toBe("autour de l'");
  });

  test('before another determiner de elides, and the plural indefinite drops', () => {
    expect(spatialHead('around', { ...MAISON, definiteness: 'indefinite' }, false, 'maison', 'locative')).toBe("autour d'une");
    expect(spatialHead('over', { ...MAISON, definiteness: 'indefinite' }, true, 'maisons', 'locative')).toBe('au-dessus de');
    expect(spatialHead('over', { ...MAISON, definiteness: 'some' }, true, 'maisons', 'locative')).toBe('au-dessus de quelques');
  });

  test('a route over crosses with par-dessus and a plain article', () => {
    expect(spatialHead('over', MARCHE, false, 'marché', 'route')).toBe('par-dessus le');
    expect(spatialHead('over', MAISON, false, 'maison', 'route')).toBe('par-dessus la');
    expect(spatialHead('over', ANGE, false, 'ange', 'route')).toBe("par-dessus l'");
    expect(spatialHead('over', MAISON, true, 'maisons', 'route')).toBe('par-dessus les');
    expect(spatialHead('over', { ...MAISON, definiteness: 'indefinite' }, false, 'maison', 'route')).toBe('par-dessus une');
  });

  test('every other relation is the same for a route and a locative', () => {
    for (const spec of ['in', 'under', 'around', 'behind', 'in_front_of', 'through'] as const) {
      expect(spatialHead(spec, MAISON, false, 'maison', 'route')).toBe(spatialHead(spec, MAISON, false, 'maison', 'locative'));
    }
  });
});

// P09-E1.
describe('spatialHead: on, between, against', () => {
  test('sur, entre and contre contract with nothing', () => {
    expect(spatialHead('on', MAISON, false, 'maison', 'locative')).toBe('sur la');
    expect(spatialHead('on', { ...MAISON, definiteness: 'indefinite' }, false, 'maison', 'locative')).toBe('sur une');
    expect(spatialHead('between', ANGE, false, 'ange', 'locative')).toBe("entre l'");
    expect(spatialHead('against', MARCHE, false, 'marché', 'route')).toBe('contre le');
  });

  test('on is apart from over, as a place and as a path', () => {
    expect(spatialHead('on', MARCHE, false, 'marché', 'locative')).toBe('sur le');
    expect(spatialHead('on', MARCHE, false, 'marché', 'route')).toBe('sur le');
    expect(spatialHead('over', MARCHE, false, 'marché', 'locative')).toBe('au-dessus du');
  });
});

// P09-E32: `among` is French's own "parmi", apart from `between`'s "entre", and contracts with nothing.
describe('spatialHead: among', () => {
  test('is parmi', () => {
    expect(spatialHead('among', ANGE, true, 'anges', 'locative')).toBe('parmi les');
    expect(spatialHead('among', ANGE, false, 'ange', 'route')).toBe("parmi l'");
  });
});
