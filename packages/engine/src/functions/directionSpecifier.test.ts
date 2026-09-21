import { describe, expect, test } from 'vitest';
import { directionSpecifier } from './directionSpecifier.js';

describe('directionSpecifier', () => {
  test('the relation chosen, where one was', () => {
    expect(directionSpecifier({ specifiers: [{ kind: 'path', value: 'in' }] })).toBe('in');
    expect(directionSpecifier({ specifiers: [{ kind: 'path', value: 'behind' }] })).toBe('behind');
  });

  test('undefined for a bare direction — the plain goal, which is not a relation', () => {
    expect(directionSpecifier({})).toBeUndefined();
    expect(directionSpecifier({ specifiers: [] })).toBeUndefined();
  });

  test('another specifier family is not one', () => {
    expect(directionSpecifier({ specifiers: [{ kind: 'sentiment', value: 'positive' }] })).toBeUndefined();
  });
});
