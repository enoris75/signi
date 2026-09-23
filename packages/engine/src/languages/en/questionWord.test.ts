import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

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
