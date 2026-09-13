import { describe, expect, test } from 'vitest';
import { adj, el, GRANDE, np, TAMANO } from './es.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('a single conjunct flagged as a dimension gloss is one', () => {
    expect(isDimensionGloss(el(np(TAMANO, { definiteness: 'bare' }, { adjectives: [adj(GRANDE)], dimensionGloss: true })))).toBe(true);
  });

  test('an unflagged phrase is not', () => {
    expect(isDimensionGloss(el(np(TAMANO, { definiteness: 'bare' }, { adjectives: [adj(GRANDE)] })))).toBe(false);
    expect(isDimensionGloss(el(np(TAMANO, {}, { dimensionGloss: false })))).toBe(false);
  });

  test('a coordination is never a gloss, even when flagged', () => {
    const flagged = np(TAMANO, { definiteness: 'bare' }, { dimensionGloss: true });
    expect(isDimensionGloss(el(flagged, flagged))).toBe(false);
  });
});
