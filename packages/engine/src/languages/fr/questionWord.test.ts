import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (fr)', () => {
  test('the subject: qui, or qu\'est-ce qui for a thing', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('qui');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe("qu'est-ce qui");
  });

  test('the object: qui / que, and quoi after a preposition', () => {
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('qui');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('que');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'de' }))).toBe('de quoi');
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_prep: 'sur' }))).toBe('sur qui');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('où');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('comment');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('pourquoi');
  });
});
