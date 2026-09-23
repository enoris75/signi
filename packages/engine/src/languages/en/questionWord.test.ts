import { describe, expect, test } from 'vitest';
import { questionWord, strandedGap } from './questionWord.js';

describe('questionWord (en)', () => {
  test('who against what over the subject and the object', () => {
    expect(questionWord({ role: 'subject', animate: true })).toBe('who');
    expect(questionWord({ role: 'subject', animate: false })).toBe('what');
    expect(questionWord({ role: 'directObject', animate: true })).toBe('who');
    expect(questionWord({ role: 'directObject', animate: false })).toBe('what');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false })).toBe('where');
    expect(questionWord({ role: 'manner', animate: false })).toBe('how');
    expect(questionWord({ role: 'cause', animate: true })).toBe('why');
  });
});

describe('questionWord (en): complement gaps (P09-E15)', () => {
  test('who / what, the adverbs, and the fronted negative cause', () => {
    expect(questionWord({ role: 'locative', animate: false, specifiers: [{ kind: 'path', value: 'under' }] })).toBe('what');
    expect(questionWord({ role: 'comitative', animate: true })).toBe('who');
    expect(questionWord({ role: 'source', animate: false })).toBe('where');
    expect(questionWord({ role: 'direction', animate: false })).toBe('where');
    expect(questionWord({ role: 'temporal', animate: false, specifiers: [{ kind: 'temporal', value: 'until' }] })).toBe('until when');
    expect(questionWord({ role: 'cause', animate: true, specifiers: [{ kind: 'sentiment', value: 'negative' }] })).toBe('through whose fault');
  });
});

describe('strandedGap', () => {
  test('the gap over an empty stand-in, where its preposition strands', () => {
    const under = strandedGap({ role: 'locative', animate: false, specifiers: [{ kind: 'path', value: 'under' }] });
    expect(under?.locative?.phrase.conjuncts[0].head.forms['base']).toBe('');
    expect(strandedGap({ role: 'source', animate: false })?.source).toBeDefined();
  });

  test('nothing where no preposition strands', () => {
    expect(strandedGap({ role: 'directObject', animate: false })).toBeUndefined();
    expect(strandedGap({ role: 'locative', animate: false })).toBeUndefined();
    expect(strandedGap({ role: 'direction', animate: false })).toBeUndefined();
    expect(strandedGap({ role: 'temporal', animate: false })).toBeUndefined();
    expect(strandedGap({ role: 'cause', animate: true, specifiers: [{ kind: 'sentiment', value: 'negative' }] })).toBeUndefined();
    expect(strandedGap(undefined)).toBeUndefined();
  });
});
