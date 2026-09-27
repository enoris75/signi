import { describe, expect, test } from 'vitest';
import { concepts } from './index.js';
import { ANTONYMS, SYNONYMS, assertValidLexicalRelations } from './relations.js';

const seeds = [
  { id: 'BIG', role: 'adjective' },
  { id: 'SMALL', role: 'adjective' },
  { id: 'LARGE', role: 'adjective' },
  { id: 'CAT', role: 'noun' },
  { id: 'EAT', role: 'verb' },
  { id: 'EAT_SENSE', role: 'verb', senseOf: 'EAT' },
];

describe('antonym and synonym pairs', () => {
  test('the seeded pairs are valid', () => {
    expect(() => assertValidLexicalRelations(concepts, ANTONYMS, SYNONYMS)).not.toThrow();
  });

  test('are folded onto both ends of each pair', () => {
    const byId = new Map(concepts.map((c) => [c.id, c]));
    expect(byId.get('BIG')?.antonyms).toEqual(['SMALL']);
    expect(byId.get('SMALL')?.antonyms).toEqual(['BIG']);
    expect(byId.get('LOW')?.antonyms).toEqual(['GREAT', 'HIGH']);
    expect(byId.get('START')?.synonyms).toEqual(['BEGIN']);
    expect(byId.get('CAT')).not.toHaveProperty('antonyms');
  });

  test('accepts a well-formed pair', () => {
    expect(() => assertValidLexicalRelations(seeds, [['BIG', 'SMALL']], [['BIG', 'LARGE']])).not.toThrow();
  });

  test.each([
    ['an unseeded concept', [['BIG', 'TINY']], [], /"TINY", which is not a seeded concept/],
    ['a sense no picker lists', [['EAT', 'EAT_SENSE']], [], /a sense of EAT/],
    ['a concept and itself', [['BIG', 'BIG']], [], /paired with itself/],
    ['two roles', [['BIG', 'CAT']], [], /joins two roles, adjective and noun/],
    ['a pair written twice', [['BIG', 'SMALL'], ['SMALL', 'BIG']], [], /written twice/],
    ['a pair both antonym and synonym', [['BIG', 'SMALL']], [['SMALL', 'BIG']], /both an antonym and a synonym/],
  ] as const)('rejects %s', (_, antonyms, synonyms, message) => {
    expect(() => assertValidLexicalRelations(seeds, antonyms, synonyms)).toThrow(message);
  });
});
