import { describe, expect, test } from 'vitest';
import { punctuate } from './punctuate.js';

describe('punctuate', () => {
  test('a relative set off on both sides, and at the end', () => {
    expect(punctuate('katė, kuri valgo , bėga')).toBe('katė, kuri valgo, bėga');
    expect(punctuate('katė mato šunį, kuris bėga,')).toBe('katė mato šunį, kuris bėga');
  });

  test('two abutting clauses keep one comma; double spaces close up', () => {
    expect(punctuate('katė mato šunį, kuris bėga,, kad')).toBe('katė mato šunį, kuris bėga, kad');
    expect(punctuate('katė  valgo')).toBe('katė valgo');
  });
});
