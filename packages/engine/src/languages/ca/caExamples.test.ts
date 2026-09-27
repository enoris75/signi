import { describe, expect, test } from 'vitest';
import { ANIMAL, el, GAT, np } from './ca.fixtures.js';
import { caExamples } from './caExamples.js';

describe('caExamples', () => {
  test('com runs on', () => {
    expect(caExamples(np(ANIMAL, {}, { examples: { relation: 'example', phrase: el(np(GAT)) } }))).toBe(' com el gat');
  });

  test('inclòs agrees with the example', () => {
    expect(caExamples(np(ANIMAL, {}, { examples: { relation: 'inclusion', phrase: el(np(GAT)) } }))).toBe(', inclòs el gat,');
    expect(caExamples(np(ANIMAL, {}, { examples: { relation: 'inclusion', phrase: el(np(GAT, { gender: 'fem', base: 'gata' })) } }))).toBe(', inclosa la gata,');
    expect(caExamples(np(ANIMAL, {}, { examples: { relation: 'inclusion', phrase: el(np(GAT, { number: 'plural' })) } }))).toBe(', inclosos els gats,');
  });

  test('nothing without examples', () => {
    expect(caExamples(np(ANIMAL))).toBe('');
  });
});
