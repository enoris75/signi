import { describe, expect, test } from 'vitest';
import { BON, CHAT, concept, FORT, GRAND, HAUT, HAUTEUR, HEUREUX, MAISON, np, PREMIER, SOURIS, TAILLE, VIEUX } from './fr.fixtures.js';
import { splitAdjectives } from './splitAdjectives.js';

describe('splitAdjectives', () => {
  test('a positive BAGS adjective or ordinal precedes the noun; the rest follow it', () => {
    const phrase = np(CHAT, {}, { adjectives: [concept(PREMIER, 'FIRST'), concept(GRAND, 'BIG'), concept(HEUREUX, 'HAPPY')] });
    expect(splitAdjectives(phrase)).toEqual({ pre: ['premier', 'grand'], post: ['heureux'] });
  });

  // A45: GREAT, the gloss degree word, is the same "grand" as BIG and precedes like it; HIGH follows.
  test('GREAT precedes like BIG; HIGH follows', () => {
    const phrase = np(TAILLE, {}, { adjectives: [concept(GRAND, 'GREAT')] });
    expect(splitAdjectives(phrase)).toEqual({ pre: ['grande'], post: [] });
    const high = np(HAUTEUR, {}, { adjectives: [concept(HAUT, 'HIGH')] });
    expect(splitAdjectives(high)).toEqual({ pre: [], post: ['haute'] });
  });

  test('every adjective agrees with the head noun', () => {
    const phrase = np(MAISON, { number: 'plural' }, { adjectives: [concept(VIEUX, 'OLD'), concept(FORT, 'STRONG')] });
    expect(splitAdjectives(phrase)).toEqual({ pre: ['vieilles'], post: ['fortes'] });
  });

  test('a compared adjective follows the noun, even a BAGS one', () => {
    const more = np(CHAT, {}, { adjectives: [concept({ ...GRAND, degree: 'more' }, 'BIG')] });
    const equally = np(SOURIS, {}, { adjectives: [concept({ ...GRAND, degree: 'equally' }, 'BIG')] });
    expect(splitAdjectives(more)).toEqual({ pre: [], post: ['plus grand'] });
    expect(splitAdjectives(equally)).toEqual({ pre: [], post: ['aussi grande'] });
  });

  test('a relative superlative repeats the definite article, agreed with the noun', () => {
    const most = (head: Record<string, string>, extra: Record<string, string> = {}) =>
      splitAdjectives(np(head, extra, { adjectives: [concept({ ...GRAND, degree: 'most' }, 'BIG')] })).post;
    expect(most(CHAT)).toEqual(['le plus grand']);
    expect(most(SOURIS)).toEqual(['la plus grande']);
    expect(most(CHAT, { number: 'plural' })).toEqual(['les plus grands']);
    expect(splitAdjectives(np(CHAT, {}, { adjectives: [concept({ ...HEUREUX, degree: 'least' }, 'HAPPY')] })).post).toEqual(['le moins heureux']);
  });

  test('a suppletive superlative doubles the article too', () => {
    const phrase = np(SOURIS, {}, { adjectives: [concept({ ...BON, degree: 'most' }, 'GOOD')] });
    expect(splitAdjectives(phrase)).toEqual({ pre: [], post: ['la meilleure'] });
  });

  test('an adjective with no surface is skipped', () => {
    const phrase = np(CHAT, {}, { adjectives: [concept({ role: 'adjective' }, 'BIG'), concept(FORT, 'STRONG')] });
    expect(splitAdjectives(phrase)).toEqual({ pre: [], post: ['fort'] });
  });
});
