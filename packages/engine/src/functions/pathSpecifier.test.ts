import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { pathSpecifier } from './pathSpecifier.js';

const HOUSE = { base: 'house' };

describe('pathSpecifier', () => {
  test('reads the chosen relation, over any fallback', () => {
    const under = complement(np(HOUSE), [{ kind: 'path', value: 'under' }]);
    expect(pathSpecifier(under)).toBe('under');
    expect(pathSpecifier(under, 'in')).toBe('under');
  });

  test('a bare route is a traversal', () => {
    expect(pathSpecifier(complement(np(HOUSE)))).toBe('through');
  });

  test("a bare complement falls back on the caller's default", () => {
    expect(pathSpecifier(complement(np(HOUSE)), 'in')).toBe('in');
  });

  test('reads only the specifiers, so a gap with no complement of its own can ask too', () => {
    expect(pathSpecifier({ specifiers: [{ kind: 'path', value: 'over' }] }, 'in')).toBe('over');
    expect(pathSpecifier({}, 'in')).toBe('in');
  });

  test('a specifier of another kind is not a path', () => {
    expect(pathSpecifier(complement(np(HOUSE), [{ kind: 'sentiment', value: 'negative' }]))).toBe('through');
  });
});
