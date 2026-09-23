import { describe, expect, test } from 'vitest';
import { questionParticle, questionWord } from './questionWord.js';

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

  // A276. The source's ablative "via" belongs to the verb, so the fronted phrase goes without it.
  test('an animate source is asked with da chi, its via left to questionParticle', () => {
    const run = { conceptId: 'RUN', forms: { base: 'correre' } };
    expect(questionWord({ role: 'source', animate: true }, verb())).toBe('da chi');
    expect(questionParticle({ role: 'source', animate: true }, verb())).toBe('via');
    expect(questionWord({ role: 'source', animate: true }, run)).toBe('da chi');
    expect(questionParticle({ role: 'source', animate: true }, run)).toBe('via');
    // A verb with no goal for "da" to collide with takes no particle (A228).
    expect(questionParticle({ role: 'source', animate: true }, verb({ complements: 'source' }))).toBe('');
  });

  test('the inanimate source is da dove, with no particle, and no other gap takes one', () => {
    const run = { conceptId: 'RUN', forms: { base: 'correre' } };
    expect(questionWord({ role: 'source', animate: false }, run)).toBe('da dove');
    expect(questionParticle({ role: 'source', animate: false }, run)).toBe('');
    expect(questionParticle({ role: 'direction', animate: true }, verb())).toBe('');
    expect(questionParticle({ role: 'directObject', animate: true }, verb())).toBe('');
  });
});
