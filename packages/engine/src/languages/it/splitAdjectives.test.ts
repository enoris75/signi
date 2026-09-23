import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { adj, ALTO, BELLO, CANE, concept, DIMENSIONE, el, FELICE, FORTE, GATTO, GRANDE, np, PRIMO, STANCO, VECCHIO } from './it.fixtures.js';
import { splitAdjectives } from './splitAdjectives.js';

const ids = (xs: ConceptForms[]) => xs.map((a) => a.conceptId);

describe('splitAdjectives', () => {
  // Italian gives the prenominal slot to ONE qualifying adjective (A145): the first in the user's
  // list wins it, and every later BAGS adjective joins the postnominal list in place.
  test('the first BAGS adjective precedes, the rest follow, each side in order', () => {
    const phrase = np(GATTO, {}, {
      adjectives: [concept(FELICE, 'HAPPY'), concept(GRANDE, 'BIG'), concept(STANCO, 'TIRED'), concept(VECCHIO, 'OLD')],
    });
    const { pre, post } = splitAdjectives(phrase);
    expect(ids(pre)).toEqual(['BIG']);
    expect(ids(post)).toEqual(['HAPPY', 'TIRED', 'OLD']);
  });

  test('a determiner-like prenominal does not take the qualifying slot, and stands in front of it', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, {
      adjectives: [concept(PRIMO, 'FIRST'), concept(GRANDE, 'BIG'), concept(VECCHIO, 'OLD')],
    }));
    expect(ids(pre)).toEqual(['FIRST', 'BIG']);
    expect(ids(post)).toEqual(['OLD']);
  });

  test('ordinals precede: il primo gatto', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, { adjectives: [concept(PRIMO, 'FIRST')] }));
    expect(ids(pre)).toEqual(['FIRST']);
    expect(post).toEqual([]);
  });

  // A45: GREAT, the gloss degree word, is the same "grande" as BIG and precedes like it.
  test('GREAT precedes like BIG: grande dimensione', () => {
    const { pre, post } = splitAdjectives(np(DIMENSIONE, {}, { adjectives: [concept(GRANDE, 'GREAT')] }));
    expect(ids(pre)).toEqual(['GREAT']);
    expect(post).toEqual([]);
  });

  test('placement keys off the concept, not the surface: grande under an unlisted concept follows', () => {
    const { pre, post } = splitAdjectives(np(GATTO, {}, { adjectives: [concept(GRANDE, 'HUGE')] }));
    expect(pre).toEqual([]);
    expect(ids(post)).toEqual(['HUGE']);
  });

  test('HIGH alto is not a BAGS adjective and follows', () => {
    const { pre, post } = splitAdjectives(np(DIMENSIONE, {}, { adjectives: [concept(ALTO, 'HIGH')] }));
    expect(pre).toEqual([]);
    expect(ids(post)).toEqual(['HIGH']);
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

describe('splitAdjectives: the compared adjective with a standard (P09-E18)', () => {
  test('moves last among the postnominal adjectives', () => {
    const compared = adj(GRANDE, { degree: 'more', standard: '1' });
    const old = adj(VECCHIO);
    const phrase = np(GATTO, {}, { adjectives: [compared, old], adjectiveStandard: { index: 0, standard: el(np(CANE)) } });
    expect(splitAdjectives(phrase).post).toEqual([old, compared]);
  });
});
