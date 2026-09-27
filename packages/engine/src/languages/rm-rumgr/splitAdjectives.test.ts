import { describe, expect, test } from 'vitest';
import { AUTER, BUN, CHAUN, GROND, NOV, adj, concept, np } from './rumgr.fixtures.js';
import { splitAdjectives } from './splitAdjectives.js';

const ids = (list: { forms: Record<string, string> }[]) => list.map((a) => a.forms['base']);

describe('splitAdjectives', () => {
  test('position: pre precedes the noun, anything else follows', () => {
    const { pre, post } = splitAdjectives(np(CHAUN, {}, { adjectives: [adj(GROND), adj(NOV)] }));
    expect(ids(pre)).toEqual(['grond']);
    expect(ids(post)).toEqual(['nov']);
  });

  test('one qualifying adjective takes the slot before the noun; a later one follows', () => {
    const { pre, post } = splitAdjectives(np(CHAUN, {}, { adjectives: [adj(BUN), adj(GROND)] }));
    expect(ids(pre)).toEqual(['bun']);
    expect(ids(post)).toEqual(['grond']);
  });

  test('a determiner-like adjective leaves the qualifying slot free', () => {
    const { pre } = splitAdjectives(np(CHAUN, {}, { adjectives: [concept(AUTER, 'OTHER'), adj(GROND)] }));
    expect(ids(pre)).toEqual(['auter', 'grond']);
  });

  test('a compared adjective follows the noun', () => {
    const { pre, post } = splitAdjectives(np(CHAUN, {}, { adjectives: [adj(GROND, { degree: 'more' })] }));
    expect(pre).toEqual([]);
    expect(ids(post)).toEqual(['grond']);
  });
});
