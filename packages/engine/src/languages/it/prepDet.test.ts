import { describe, expect, test } from 'vitest';
import { ACQUA, BASTONE, CASA, CURA, GATTO, MODO, UOMO, VELOCITA } from './it.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the definite article fuses with a, da, di and in', () => {
    expect(prepDet('a', CASA, false, 'casa')).toBe('alla');
    expect(prepDet('a', VELOCITA, false, 'velocità')).toBe('alla');
    expect(prepDet('da', { ...UOMO, definiteness: 'definite' }, false, 'uomo')).toBe("dall'");
    expect(prepDet('in', MODO, false, 'modo')).toBe('nel');
    expect(prepDet('di', GATTO, true, 'gatti')).toBe('dei');
  });

  test('con and come never fuse', () => {
    expect(prepDet('con', BASTONE, false, 'bastone')).toBe('con il');
    expect(prepDet('con', ACQUA, false, 'acqua')).toBe("con l'");
    expect(prepDet('come', GATTO, false, 'gatto')).toBe('come il');
  });

  test('an indefinite article or quantifier stays apart from the preposition', () => {
    expect(prepDet('a', { ...CASA, definiteness: 'indefinite' }, false, 'casa')).toBe('a una');
    expect(prepDet('da', { ...UOMO, definiteness: 'indefinite' }, false, 'uomo')).toBe('da un');
    expect(prepDet('a', { ...CASA, definiteness: 'no' }, false, 'casa')).toBe('a nessuna');
    expect(prepDet('a', { ...CASA, definiteness: 'many' }, true, 'case')).toBe('a molte');
    expect(prepDet('con', { ...GATTO, definiteness: 'this' }, false, 'gatto')).toBe('con questo');
  });

  test('all keeps its own unfused article: a tutte le case', () => {
    expect(prepDet('a', { ...CASA, definiteness: 'all' }, true, 'case')).toBe('a tutte le');
  });

  test('a bare noun leaves the preposition alone: con cura, in modo', () => {
    expect(prepDet('con', { ...CURA, definiteness: 'bare' }, false, 'cura')).toBe('con');
    expect(prepDet('in', { ...MODO, definiteness: 'bare' }, false, 'modo')).toBe('in');
  });
});
