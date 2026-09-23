import { describe, expect, test } from 'vitest';
import { HAUS, KATZE, WIND } from './de.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('in fuses with the definite dative dem', () => {
    expect(spatialHead('in', HAUS, false, 'locative')).toBe('im');
    expect(spatialHead('in', KATZE, false, 'locative')).toBe('in der');
    expect(spatialHead('in', HAUS, true, 'locative')).toBe('in den');
  });

  // A218: a place one is at names its own preposition, which the plain relation takes in its place.
  test('the plain relation takes the noun\'s own place preposition', () => {
    const ORT = { base: 'Ort', plural: 'Orte', gender: 'masc', count: 'singular', place_prep: 'an' };
    expect(spatialHead('in', ORT, false, 'locative')).toBe('am');
    expect(spatialHead('in', { ...ORT, definiteness: 'indefinite' }, false, 'locative')).toBe('an einem');
    expect(spatialHead('in', { ...ORT, definiteness: 'indefinite' }, false, 'direction')).toBe('an einen');
    expect(spatialHead('under', ORT, false, 'locative')).toBe('unter dem');
  });

  test('in does not fuse with any other determiner', () => {
    expect(spatialHead('in', { ...HAUS, definiteness: 'indefinite' }, false, 'locative')).toBe('in einem');
    expect(spatialHead('in', { ...HAUS, definiteness: 'this' }, false, 'locative')).toBe('in diesem');
  });

  test('the other two-way prepositions take the dative, unfused', () => {
    expect(spatialHead('under', HAUS, false, 'locative')).toBe('unter dem');
    expect(spatialHead('over', KATZE, false, 'locative')).toBe('über der');
    expect(spatialHead('behind', HAUS, true, 'locative')).toBe('hinter den');
    expect(spatialHead('in_front_of', HAUS, false, 'locative')).toBe('vor dem');
  });

  test('a route over crosses in the accusative, unfused', () => {
    expect(spatialHead('over', KATZE, false, 'route')).toBe('über die');
    expect(spatialHead('over', HAUS, false, 'route')).toBe('über das');
    expect(spatialHead('over', WIND, false, 'route')).toBe('über den');
    expect(spatialHead('over', HAUS, true, 'route')).toBe('über die');
    expect(spatialHead('over', { ...HAUS, definiteness: 'indefinite' }, false, 'route')).toBe('über ein');
  });

  test('a route under, behind or in front of keeps the dative', () => {
    expect(spatialHead('under', HAUS, false, 'route')).toBe('unter dem');
    expect(spatialHead('behind', KATZE, false, 'route')).toBe('hinter der');
    expect(spatialHead('in_front_of', HAUS, true, 'route')).toBe('vor den');
  });

  test('durch and um take the accusative', () => {
    expect(spatialHead('through', WIND, false, 'locative')).toBe('durch den');
    expect(spatialHead('through', HAUS, true, 'locative')).toBe('durch die');
    expect(spatialHead('around', HAUS, false, 'locative')).toBe('um das');
  });
});

// P09-E1.
describe('spatialHead: on, between, against', () => {
  test('auf, zwischen and an take the dative of place', () => {
    expect(spatialHead('on', HAUS, false, 'locative')).toBe('auf dem');
    expect(spatialHead('on', { ...HAUS, definiteness: 'indefinite' }, false, 'locative')).toBe('auf einem');
    expect(spatialHead('between', KATZE, false, 'locative')).toBe('zwischen der');
    expect(spatialHead('against', KATZE, false, 'locative')).toBe('an der');
  });

  test('an fuses with the definite dative, as a place one is at does', () => {
    expect(spatialHead('against', HAUS, false, 'locative')).toBe('am');
    expect(spatialHead('against', { ...HAUS, definiteness: 'indefinite' }, false, 'locative')).toBe('an einem');
  });

  test('under a direction all three take the accusative of motion', () => {
    expect(spatialHead('on', HAUS, false, 'direction')).toBe('auf das');
    expect(spatialHead('between', KATZE, false, 'direction')).toBe('zwischen die');
    expect(spatialHead('against', HAUS, false, 'direction')).toBe('ans');
  });
});
