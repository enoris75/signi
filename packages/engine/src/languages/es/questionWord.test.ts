import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (es)', () => {
  test('quién against qué, the object person taking the personal a', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('quién');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('qué');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('a quién');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('qué');
  });

  test('the verb\'s own marking of its object wins', () => {
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_no_a: '1' }))).toBe('quién');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_a: '1' }))).toBe('a qué');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'de' }))).toBe('de qué');
  });

  test('the adverbial gaps carry their accent', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('dónde');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('cómo');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('por qué');
  });

  // A374: the route's *por* over a person would read as *for whom*.
  test('a route asks through a place with por, through a person with the spelled path', () => {
    expect(questionWord({ role: 'route', animate: false }, verb())).toBe('por dónde');
    expect(questionWord({ role: 'route', animate: true }, verb())).toBe('a través de quién');
  });
});
