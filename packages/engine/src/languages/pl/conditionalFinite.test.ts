import { describe, expect, test } from 'vitest';
import { conditionalFinite } from './conditionalFinite.js';
import { JESC, MOC } from './pl.fixtures.js';

describe('conditionalFinite', () => {
  test('participle + by + ending', () => {
    expect(conditionalFinite(JESC, true, { person: '1', plural: false, gender: 'masc', virile: false })).toBe('zjadłbym');
    expect(conditionalFinite(JESC, true, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('zjadłaby');
    expect(conditionalFinite(JESC, true, { person: '1', plural: true, gender: 'masc', virile: true })).toBe('zjedlibyśmy');
    expect(conditionalFinite(MOC, false, { person: '1', plural: false, gender: 'masc', virile: false })).toBe('mógłbym');
  });
});
