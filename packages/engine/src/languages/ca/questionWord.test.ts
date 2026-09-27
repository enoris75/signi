import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord', () => {
  test('qui against què; the object person is a qui, apart from the subject\'s', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('qui');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('què');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('a qui');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('què');
  });

  test('a verb\'s own preposition asks with it', () => {
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'de' }))).toBe('de què');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('on');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('com');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('per què');
  });

  test('a route asks through a place with per on, through a person with a través de', () => {
    expect(questionWord({ role: 'route', animate: false }, verb())).toBe('per on');
    expect(questionWord({ role: 'route', animate: true }, verb())).toBe('a través de qui');
  });

  test('the possessor is de qui', () => {
    expect(questionWord({ role: 'possessor', animate: true }, verb())).toBe('de qui');
  });
});
