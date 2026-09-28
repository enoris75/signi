import { describe, expect, test } from 'vitest';
import { CHASA, CHAUN } from './rumgr.fixtures.js';
import { spatialHead } from './spatialHead.js';

describe('spatialHead', () => {
  test('each relation its preposition, none contracting', () => {
    expect(spatialHead('in', CHAUN, false, 'chaun')).toBe('en il');
    expect(spatialHead('on', CHAUN, false, 'chaun')).toBe('sin il');
    expect(spatialHead('under', CHASA, false, 'chasa')).toBe('sut la');
    expect(spatialHead('behind', CHASA, true, 'chasas')).toBe('davos las');
    expect(spatialHead('in_front_of', CHASA, false, 'chasa')).toBe('davant la');
    expect(spatialHead('around', CHASA, false, 'chasa')).toBe('enturn la');
    expect(spatialHead('through', CHASA, false, 'chasa')).toBe('tras la');
    expect(spatialHead('between', CHASA, false, 'chasa')).toBe('tranter la');
  });

  test('the determiner the head picked', () => {
    expect(spatialHead('in', { ...CHASA, definiteness: 'indefinite' }, false, 'chasa')).toBe('en ina');
  });
});

// A02: the distance pair, adverb + "da", which contracts with the masculine article (verify).
describe('spatialHead: near and far', () => {
  test('datiers da, lunsch da', () => {
    expect(spatialHead('near', CHAUN, false, 'chaun')).toBe('datiers dal');
    expect(spatialHead('far', CHASA, false, 'chasa')).toBe('lunsch da la');
  });
});
