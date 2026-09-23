import { describe, expect, test } from 'vitest';
import { ACQUA, BASTONE, CASA, CURA, EUROPA, GATTO, MODO, UOMO, VELOCITA } from './it.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the definite article fuses with a, da, di and in', () => {
    expect(prepDet('a', CASA, false, 'casa')).toBe('alla');
    expect(prepDet('a', VELOCITA, false, 'velocità')).toBe('alla');
    expect(prepDet('da', { ...UOMO, definiteness: 'definite' }, false, 'uomo')).toBe("dall'");
    expect(prepDet('in', MODO, false, 'modo')).toBe('nel');
    expect(prepDet('di', GATTO, true, 'gatti')).toBe('dei');
  });

  // A continent takes the definite article whatever was picked (see `artFor`), so it fuses like one.
  test('a proper noun fuses whatever determiner was picked', () => {
    expect(prepDet('da', { ...EUROPA, definiteness: 'indefinite' }, false, 'Europa')).toBe("dall'");
    expect(prepDet('a', { ...EUROPA, definiteness: 'this' }, false, 'Europa')).toBe("all'");
  });

  // The partitive is itself di + article, so it fuses rather than stacking a second preposition.
  test('a mass noun\'s partitive fuses like the definite article', () => {
    expect(prepDet('di', { ...ACQUA, definiteness: 'some' }, false, 'acqua')).toBe("dell'");
    expect(prepDet('da', { ...ACQUA, definiteness: 'some' }, false, 'acqua')).toBe("dall'");
    expect(prepDet('con', { ...ACQUA, definiteness: 'some' }, false, 'acqua')).toBe("con dell'");
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

  // P09-E2's purpose and privative: "per l'uomo", "senza il bastone" — neither fuses.
  test('per and senza never fuse', () => {
    expect(prepDet('per', BASTONE, false, 'bastone')).toBe('per il');
    expect(prepDet('senza', ACQUA, false, 'acqua')).toBe("senza l'");
    expect(prepDet('senza', { ...GATTO, definiteness: 'indefinite' }, false, 'gatto')).toBe('senza un');
  });

  test('all keeps its own unfused article: a tutte le case', () => {
    expect(prepDet('a', { ...CASA, definiteness: 'all' }, true, 'case')).toBe('a tutte le');
  });

  test('a bare noun leaves the preposition alone: con cura, in modo', () => {
    expect(prepDet('con', { ...CURA, definiteness: 'bare' }, false, 'cura')).toBe('con');
    expect(prepDet('in', { ...MODO, definiteness: 'bare' }, false, 'modo')).toBe('in');
  });
});
