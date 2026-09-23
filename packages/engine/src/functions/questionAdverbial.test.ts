import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import type { ResolvedQuestion } from '../types.js';
import { questionAdverbial } from './questionAdverbial.js';

const q = (role: ResolvedQuestion['role'], specifiers?: Specifier[], animate = false): ResolvedQuestion =>
  ({ role, animate, ...(specifiers ? { specifiers } : {}) });

describe('questionAdverbial', () => {
  test('E6\'s adverbs: the plain locative, the manner, the neutral cause', () => {
    expect(questionAdverbial(q('locative'))).toBe('where');
    expect(questionAdverbial(q('locative', [{ kind: 'path', value: 'in' }]))).toBe('where');
    expect(questionAdverbial(q('manner'))).toBe('how');
    expect(questionAdverbial(q('cause'))).toBe('why');
  });

  test('a marked relation is no adverb: it keeps its preposition', () => {
    expect(questionAdverbial(q('locative', [{ kind: 'path', value: 'under' }]))).toBeUndefined();
    expect(questionAdverbial(q('cause', [{ kind: 'sentiment', value: 'positive' }]))).toBeUndefined();
    expect(questionAdverbial(q('cause', [{ kind: 'sentiment', value: 'negative' }], true))).toBeUndefined();
  });

  test('a direction or source asked of a place is where (to) / where from, of a person the complement path', () => {
    expect(questionAdverbial(q('direction'))).toBe('whereTo');
    expect(questionAdverbial(q('source'))).toBe('whereFrom');
    expect(questionAdverbial(q('direction', undefined, true))).toBeUndefined();
    expect(questionAdverbial(q('source', undefined, true))).toBeUndefined();
    expect(questionAdverbial(q('direction', [{ kind: 'path', value: 'under' }]))).toBeUndefined();
  });

  test('a time is when, or until when', () => {
    expect(questionAdverbial(q('temporal'))).toBe('when');
    expect(questionAdverbial(q('temporal', [{ kind: 'temporal', value: 'at' }]))).toBe('when');
    expect(questionAdverbial(q('temporal', [{ kind: 'temporal', value: 'until' }]))).toBe('untilWhen');
  });

  test('the clause slots and the other complements have none', () => {
    for (const role of ['subject', 'directObject', 'possessor', 'instrumental', 'comitative', 'terminus', 'topic', 'route'] as const) {
      expect(questionAdverbial(q(role))).toBeUndefined();
    }
    expect(questionAdverbial(undefined)).toBeUndefined();
  });
});
