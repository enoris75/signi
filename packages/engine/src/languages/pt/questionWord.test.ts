import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (pt)', () => {
  test('quem against o que', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('quem');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('o que');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('quem');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('o que');
  });

  test('after a preposition the thing is the bare que', () => {
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'de' }))).toBe('de que');
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_prep: 'para' }))).toBe('para quem');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('onde');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('como');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('por que');
  });
});
