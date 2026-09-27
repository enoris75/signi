import { describe, expect, test } from 'vitest';
import { adj, el, GRAN, np, MIDA } from './ca.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('a single conjunct flagged as a dimension gloss is one', () => {
    expect(isDimensionGloss(el(np(MIDA, { definiteness: 'bare' }, { adjectives: [adj(GRAN)], dimensionGloss: true })))).toBe(true);
  });

  test('an unflagged phrase is not', () => {
    expect(isDimensionGloss(el(np(MIDA, { definiteness: 'bare' }, { adjectives: [adj(GRAN)] })))).toBe(false);
    expect(isDimensionGloss(el(np(MIDA, {}, { dimensionGloss: false })))).toBe(false);
  });

  test('a coordination is never a gloss, even when flagged', () => {
    const flagged = np(MIDA, { definiteness: 'bare' }, { dimensionGloss: true });
    expect(isDimensionGloss(el(flagged, flagged))).toBe(false);
  });
});
