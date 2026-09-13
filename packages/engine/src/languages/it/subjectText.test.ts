import { describe, expect, test } from 'vitest';
import { CANE, concept, el, GATTA, GATTO, GRANDE, group, IO, LUI, np, VECCHIO, VOLPE } from './it.fixtures.js';
import { subjectText } from './subjectText.js';

describe('subjectText', () => {
  test('a single noun or pronoun subject', () => {
    expect(subjectText(el(np(GATTO)))).toBe('il gatto');
    expect(subjectText(el(np(GATTA, { number: 'plural' })))).toBe('le gatte');
    expect(subjectText(el(np(IO)))).toBe('io');
  });

  test('coordinates the conjuncts, repeating the article on each', () => {
    expect(subjectText(el(np(GATTO), np(CANE), np(VOLPE)))).toBe('il gatto, il cane e la volpe');
    expect(subjectText(group('or', np(GATTO), np(CANE)))).toBe('il gatto o il cane');
    expect(subjectText(el(np(IO), np(LUI)))).toBe('io e lui');
  });

  test('each conjunct keeps its own determiner, number and adjectives', () => {
    const big = np(GATTO, { definiteness: 'indefinite' }, { adjectives: [concept(GRANDE, 'BIG')] });
    const old = np(CANE, { number: 'plural' }, { adjectives: [concept(VECCHIO, 'OLD')] });
    expect(subjectText(el(big, old))).toBe('un grande gatto e i vecchi cani');
  });
});
