import { describe, expect, test } from 'vitest';
import { questionAdverb } from './questionAdverb.js';

describe('questionAdverb', () => {
  test('どうやって for the manner, なぜ for the cause', () => {
    expect(questionAdverb({ role: 'manner', animate: false })).toEqual([{ t: 'どうやって' }]);
    expect(questionAdverb({ role: 'cause', animate: false })).toEqual([{ t: 'なぜ' }]);
  });

  test('nothing for the noun gaps, for no question, and for the copula\'s manner', () => {
    expect(questionAdverb({ role: 'directObject', animate: false })).toEqual([]);
    expect(questionAdverb(undefined)).toEqual([]);
    expect(questionAdverb({ role: 'manner', animate: false }, true)).toEqual([]);
    expect(questionAdverb({ role: 'cause', animate: false }, true)).toEqual([{ t: 'なぜ' }]);
  });
});

describe('questionAdverb: time (P09-E15)', () => {
  test('a plain when is いつ, with no particle; until when is questionNoun\'s', () => {
    expect(questionAdverb({ role: 'temporal', animate: false })).toEqual([{ t: 'いつ' }]);
    expect(questionAdverb({ role: 'temporal', animate: false, specifiers: [{ kind: 'temporal', value: 'until' }] })).toEqual([]);
    expect(questionAdverb({ role: 'cause', animate: true, specifiers: [{ kind: 'sentiment', value: 'negative' }] })).toEqual([]);
  });
});
