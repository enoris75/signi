import { describe, expect, test } from 'vitest';
import { indirectQuestionWord } from './indirectQuestionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('indirectQuestionWord (fr)', () => {
  test('a thing is "ce qui" over the subject and "ce que" over the object', () => {
    expect(indirectQuestionWord({ role: 'subject', animate: false }, verb())).toBe('ce qui');
    expect(indirectQuestionWord({ role: 'directObject', animate: false }, verb())).toBe('ce que');
  });

  test('a person is "qui", as in the direct question', () => {
    expect(indirectQuestionWord({ role: 'subject', animate: true }, verb())).toBe('qui');
    expect(indirectQuestionWord({ role: 'directObject', animate: true }, verb())).toBe('qui');
  });

  test('after the verb\'s preposition a thing is still "quoi"', () => {
    expect(indirectQuestionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'à' }))).toBe('à quoi');
  });

  test('the adverbial gaps keep their words', () => {
    expect(indirectQuestionWord({ role: 'locative', animate: false }, verb())).toBe('où');
    expect(indirectQuestionWord({ role: 'manner', animate: false }, verb())).toBe('comment');
    expect(indirectQuestionWord({ role: 'cause', animate: false }, verb())).toBe('pourquoi');
  });
});
