import { describe, expect, test } from 'vitest';
import { HAUS, KATZE, WIND } from './de.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('in fuses with the definite dative dem', () => {
    expect(spatialHead('in', HAUS, false)).toBe('im');
    expect(spatialHead('in', KATZE, false)).toBe('in der');
    expect(spatialHead('in', HAUS, true)).toBe('in den');
  });

  test('in does not fuse with any other determiner', () => {
    expect(spatialHead('in', { ...HAUS, definiteness: 'indefinite' }, false)).toBe('in einem');
    expect(spatialHead('in', { ...HAUS, definiteness: 'this' }, false)).toBe('in diesem');
  });

  test('the other two-way prepositions take the dative, unfused', () => {
    expect(spatialHead('under', HAUS, false)).toBe('unter dem');
    expect(spatialHead('over', KATZE, false)).toBe('über der');
    expect(spatialHead('behind', HAUS, true)).toBe('hinter den');
    expect(spatialHead('in_front_of', HAUS, false)).toBe('vor dem');
  });

  test('durch and um take the accusative', () => {
    expect(spatialHead('through', WIND, false)).toBe('durch den');
    expect(spatialHead('through', HAUS, true)).toBe('durch die');
    expect(spatialHead('around', HAUS, false)).toBe('um das');
  });
});
