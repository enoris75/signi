import { describe, expect, test } from 'vitest';
import { EUROPA, HAUS, KATER, KATZE, SCHWEIZ, WASSER } from './de.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('a definite article fuses with in (dative dem, accusative das) and zu', () => {
    expect(prepDet('in', HAUS, 'dat', false)).toBe('im');
    expect(prepDet('in', HAUS, 'acc', false)).toBe('ins');
    expect(prepDet('zu', KATER, 'dat', false)).toBe('zum');
    expect(prepDet('zu', KATZE, 'dat', false)).toBe('zur');
    expect(prepDet('zu', SCHWEIZ, 'dat', false)).toBe('zur');
    // An articled name fuses whatever determiner was picked, since its article surfaces regardless.
    expect(prepDet('zu', { ...SCHWEIZ, definiteness: 'indefinite' }, 'dat', false)).toBe('zur');
  });

  test('any other preposition-article pair stays apart', () => {
    expect(prepDet('in', KATZE, 'dat', false)).toBe('in der');
    expect(prepDet('zu', HAUS, 'dat', true)).toBe('zu den');
    expect(prepDet('aus', HAUS, 'dat', false)).toBe('aus dem');
    expect(prepDet('unter', KATER, 'acc', false)).toBe('unter den');
    // "ums" / "durchs" are colloquial, so only "ins" fuses in the accusative.
    expect(prepDet('um', HAUS, 'acc', false)).toBe('um das');
  });

  test('a non-definite determiner never fuses', () => {
    expect(prepDet('in', { ...HAUS, definiteness: 'indefinite' }, 'dat', false)).toBe('in einem');
    expect(prepDet('zu', { ...KATZE, definiteness: 'no' }, 'dat', false)).toBe('zu keiner');
    expect(prepDet('zu', { ...KATER, definiteness: 'this' }, 'dat', false)).toBe('zu diesem');
    expect(prepDet('mit', { ...HAUS, definiteness: 'many' }, 'dat', true)).toBe('mit vielen');
  });

  test('with no determiner the preposition stands alone', () => {
    expect(prepDet('mit', { ...WASSER, definiteness: 'bare' }, 'dat', false)).toBe('mit');
    expect(prepDet('in', EUROPA, 'dat', false)).toBe('in');
  });

  test('an empty preposition leaves the bare dative determiner', () => {
    expect(prepDet('', KATER, 'dat', false)).toBe('dem');
    expect(prepDet('', { ...KATZE, definiteness: 'indefinite' }, 'dat', false)).toBe('einer');
  });
});
