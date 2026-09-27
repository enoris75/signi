import { describe, expect, test } from 'vitest';
import { CASA, GAT } from './ca.fixtures.js';
import { demonstrative } from './demonstrative.js';

describe('demonstrative', () => {
  test('aquest, aquesta, aquests, aquestes', () => {
    expect(demonstrative(false, GAT)).toBe('aquest');
    expect(demonstrative(false, CASA)).toBe('aquesta');
    expect(demonstrative(false, GAT, true)).toBe('aquests');
    expect(demonstrative(false, CASA, true)).toBe('aquestes');
  });

  test('aquell, aquella, aquells, aquelles', () => {
    expect(demonstrative(true, GAT)).toBe('aquell');
    expect(demonstrative(true, CASA)).toBe('aquella');
    expect(demonstrative(true, GAT, true)).toBe('aquells');
    expect(demonstrative(true, CASA, true)).toBe('aquelles');
  });
});
