import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { adj, BELLO, concept, FELICE, FORTE, GATTO, GRANDE, np, PRIMO, STANCO, VECCHIO } from './it.fixtures.js';
import { splitAdjectives } from './splitAdjectives.js';

const ids = (xs: ConceptForms[]) => xs.map((a) => a.conceptId);

describe('splitAdjectives', () => {
  test('the BAGS adjectives precede, the rest follow, each side in order', () => {
    const phrase = np(GATTO, {}, {
      adjectives: [concept(FELICE, 'HAPPY'), concept(GRANDE, 'BIG'), concept(STANCO, 'TIRED'), concept(VECCHIO, 'OLD')],
    });
    const { pre, post } = splitAdjectives(phrase);
    expect(ids(pre)).toEqual(['BIG', 'OLD']);
    expect(ids(post)).toEqual(['HAPPY', 'TIRED']);
  });

  test('ordinals precede: il primo gatto', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, { adjectives: [concept(PRIMO, 'FIRST')] }));
    expect(ids(pre)).toEqual(['FIRST']);
    expect(post).toEqual([]);
  });

  // GREAT belongs before the noun (A45); this pins the current placement, which the fix changes.
  test('placement keys off the concept, not the surface: GREAT grande follows', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, { adjectives: [concept(GRANDE, 'GREAT')] }));
    expect(pre).toEqual([]);
    expect(ids(post)).toEqual(['GREAT']);
  });

  test('a graded prenominal adjective moves after the noun: il gatto più bello', () => {
    const phrase = np(GATTO, {}, {
      adjectives: [concept({ ...BELLO, degree: 'most' }, 'BEAUTIFUL'), concept({ ...GRANDE, degree: 'equally' }, 'BIG')],
    });
    const { pre, post } = splitAdjectives(phrase);
    expect(pre).toEqual([]);
    expect(ids(post)).toEqual(['BEAUTIFUL', 'BIG']);
  });

  test('a graded postnominal adjective stays after the noun', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, { adjectives: [adj(FORTE, { degree: 'more' })] }));
    expect(pre).toEqual([]);
    expect(post).toHaveLength(1);
  });

  test('no adjectives, nothing either side', () => {
    expect(splitAdjectives(np(GATTO))).toEqual({ pre: [], post: [] });
  });
});
