import { describe, expect, test } from 'vitest';
import type { Degree } from '@signi/shared';
import { LOOKUP } from '../translator.fixtures.js';
import { resolve } from './resolve.js';
import { resolveStandard } from './resolveStandard.js';

const head = (id = 'BIG') => resolve(id, 'it', LOOKUP);
const plan = (headDegree: Degree) => ({ concept: 'BIG', headDegree, headStandard: { concept: 'DOG' } });

describe('resolveStandard', () => {
  test('the comparatives and the equative resolve their standard and mark the head', () => {
    for (const degree of ['more', 'less', 'equally'] as const) {
      const h = head();
      const standard = resolveStandard(plan(degree), h, 'it', LOOKUP);
      expect(standard?.conjuncts.map((c) => c.head.forms['base'])).toEqual(['cane']);
      expect(h.forms['standard']).toBe('1');
      expect(h.forms).not.toHaveProperty('domain');
    }
  });

  test('the superlatives resolve it as their set and mark the head domain, never standard (P09-E19)', () => {
    for (const degree of ['most', 'least'] as const) {
      const h = head();
      const set = resolveStandard(plan(degree), h, 'it', LOOKUP);
      expect(set?.conjuncts.map((c) => c.head.forms['base'])).toEqual(['cane']);
      expect(h.forms['domain']).toBe('1');
      expect(h.forms).not.toHaveProperty('standard');
    }
  });

  test('positive drops it, leaving the head unmarked', () => {
    const h = head();
    expect(resolveStandard(plan('positive'), h, 'it', LOOKUP)).toBeUndefined();
    expect(h.forms).not.toHaveProperty('standard');
    expect(h.forms).not.toHaveProperty('domain');
  });

  test('a noun head takes no standard', () => {
    const h = head('CAT');
    expect(resolveStandard({ ...plan('more'), concept: 'CAT' }, h, 'it', LOOKUP)).toBeUndefined();
  });

  test('a coordinated standard resolves as one noun element', () => {
    const standard = resolveStandard(
      { concept: 'BIG', headDegree: 'more', headStandard: { conjuncts: [{ concept: 'DOG' }, { concept: 'CAT' }], conjunction: 'and' } },
      head(), 'it', LOOKUP,
    );
    expect(standard?.conjuncts.map((c) => c.head.forms['base'])).toEqual(['cane', 'gatto']);
    expect(standard?.conjunction).toBe('and');
  });
});
