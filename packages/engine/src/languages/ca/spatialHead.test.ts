import { describe, expect, test } from 'vitest';
import { CASA, EUROPA, GAT, np } from './ca.fixtures.js';
import { caSurface } from './caSurface.js';
import { inHead, spatialHead } from './spatialHead.js';

const head = (...args: Parameters<typeof spatialHead>) => caSurface(`${spatialHead(...args)} x`).slice(0, -2);

describe('spatialHead', () => {
  test('the relations that govern the phrase directly', () => {
    expect(spatialHead('under', false, CASA)).toBe('sota la');
    expect(spatialHead('on', false, CASA)).toBe('sobre la');
    expect(spatialHead('against', false, CASA)).toBe('contra la');
    expect(spatialHead('between', false, CASA)).toBe('entre la');
  });

  test('the de-locutions contract through their de', () => {
    expect(head('behind', false, GAT)).toBe('darrere del');
    expect(head('in_front_of', false, GAT)).toBe('davant del');
    expect(head('around', false, GAT)).toBe('al voltant del');
    expect(head('over', false, CASA)).toBe('per sobre de la');
  });

  test('the route is per, contracting', () => {
    expect(head('through', false, GAT)).toBe('pel');
  });
});

describe('inHead', () => {
  test('a before the definite article and a place name, en before any other determiner and a bare noun', () => {
    expect(inHead(CASA, false)).toBe('a la');
    expect(inHead(EUROPA, false)).toBe('a');
    expect(inHead({ ...CASA, definiteness: 'indefinite' }, false)).toBe('en una');
    expect(inHead({ ...CASA, definiteness: 'no' }, false)).toBe('en cap');
    expect(inHead({ ...CASA, definiteness: 'bare' }, false)).toBe('en');
    expect(np(CASA).head.forms['base']).toBe('casa');
  });
});

// A02: the distance pair, both ending in "de", which contracts with the article.
describe('spatialHead: near and far', () => {
  test('a prop de, lluny de', () => {
    expect(head('near', false, CASA)).toBe('a prop de la');
    expect(head('far', false, GAT)).toBe('lluny del');
  });
});
