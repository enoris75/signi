import { describe, expect, test } from 'vitest';
import type { Degree } from '@signi/shared';
import { adj } from '../languages/resolved.fixtures.js';
import { degreeAdverb } from './degreeAdverb.js';

const BIG = { base: 'big' };
const TABLE: Record<Degree, string> = {
  positive: '', more: 'more', most: 'most', less: 'less', least: 'least', equally: 'equally',
};

describe('degreeAdverb', () => {
  test('a bare degree reads the plain table, whatever the standard table says', () => {
    expect(degreeAdverb(adj(BIG, { degree: 'equally' }), TABLE, { equally: 'as' })).toBe('equally');
  });

  test('a degree with a standard reads the standard table first', () => {
    expect(degreeAdverb(adj(BIG, { degree: 'equally', standard: '1' }), TABLE, { equally: 'as' })).toBe('as');
  });

  test('a degree the standard table leaves out keeps its plain word', () => {
    expect(degreeAdverb(adj(BIG, { degree: 'more', standard: '1' }), TABLE, { equally: 'as' })).toBe('more');
    expect(degreeAdverb(adj(BIG, { degree: 'equally', standard: '1' }), TABLE)).toBe('equally');
  });

  // A255: an equative intensifier is the degree's word itself ("just as big").
  test('an equative intensifier leaves the degree no adverb of its own', () => {
    const under = { degree: 'equally', intensifier: 'just as', intensifier_equative: '1' };
    expect(degreeAdverb(adj(BIG, under), TABLE, { equally: 'as' })).toBe('');
    expect(degreeAdverb(adj(BIG, { ...under, standard: '1' }), TABLE, { equally: 'as' })).toBe('');
  });
});
