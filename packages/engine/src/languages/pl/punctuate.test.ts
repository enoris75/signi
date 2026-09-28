import { describe, expect, test } from 'vitest';
import { punctuate } from './punctuate.js';

describe('punctuate', () => {
  test('a relative set off on both sides, and at the end', () => {
    expect(punctuate('kot, który je , biegnie')).toBe('kot, który je, biegnie');
    expect(punctuate('kot widzi psa, który biegnie,')).toBe('kot widzi psa, który biegnie');
  });

  test('two abutting clauses keep one comma', () => {
    expect(punctuate('kot widzi psa, który biegnie,, że')).toBe('kot widzi psa, który biegnie, że');
  });
});
