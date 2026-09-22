import { describe, expect, test } from 'vitest';
import { EUROPA, HAUS, KATER, KATZE, SCHWEIZ, WASSER } from './de.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('a definite article fuses with in (dative dem, accusative das), zu and von', () => {
    expect(prepDet('in', HAUS, 'dat', false)).toBe('im');
    expect(prepDet('in', HAUS, 'acc', false)).toBe('ins');
    expect(prepDet('zu', KATER, 'dat', false)).toBe('zum');
    expect(prepDet('zu', KATZE, 'dat', false)).toBe('zur');
    expect(prepDet('zu', SCHWEIZ, 'dat', false)).toBe('zur');
    // A living source's "von" (A154); "von der" does not contract.
    expect(prepDet('von', KATER, 'dat', false)).toBe('vom');
    expect(prepDet('von', HAUS, 'dat', false)).toBe('vom');
    // An articled name fuses whatever determiner was picked, since its article surfaces regardless.
    expect(prepDet('zu', { ...SCHWEIZ, definiteness: 'indefinite' }, 'dat', false)).toBe('zur');
  });

  // A218: the "an" of a place one is at fuses as "in" does ("am Ende", "ans Ziel"); "an der" does not.
  test('a definite article fuses with an, in the dative and the accusative', () => {
    expect(prepDet('an', HAUS, 'dat', false)).toBe('am');
    expect(prepDet('an', KATER, 'dat', false)).toBe('am');
    expect(prepDet('an', HAUS, 'acc', false)).toBe('ans');
    expect(prepDet('an', KATER, 'acc', false)).toBe('an den');
    expect(prepDet('an', KATZE, 'dat', false)).toBe('an der');
    expect(prepDet('an', { ...HAUS, definiteness: 'indefinite' }, 'dat', false)).toBe('an einem');
  });

  test('any other preposition-article pair stays apart', () => {
    expect(prepDet('in', KATZE, 'dat', false)).toBe('in der');
    expect(prepDet('zu', HAUS, 'dat', true)).toBe('zu den');
    expect(prepDet('aus', HAUS, 'dat', false)).toBe('aus dem');
    expect(prepDet('von', KATZE, 'dat', false)).toBe('von der');
    expect(prepDet('von', HAUS, 'dat', true)).toBe('von den');
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
