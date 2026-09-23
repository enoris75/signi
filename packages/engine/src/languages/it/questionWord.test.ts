import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (it)', () => {
  test('chi against che cosa, over the subject and the object alike', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('chi');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('che cosa');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('chi');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('che cosa');
  });

  test('a prepositional object asks with its preposition; a subject never does', () => {
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'da' }))).toBe('da che cosa');
    expect(questionWord({ role: 'subject', animate: true }, verb({ object_prep: 'da' }))).toBe('chi');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('dove');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('come');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('perché');
  });
});
