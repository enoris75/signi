import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (de)', () => {
  test('wer declines for the slot it asks about; was does not', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('wer');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('wen');
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_case: 'dat' }))).toBe('wem');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('was');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_case: 'dat' }))).toBe('was');
  });

  test('a prepositional object: the preposition over wen / wem, or the wo(r)- compound', () => {
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_prep: 'auf' }))).toBe('auf wen');
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_prep: 'von' }))).toBe('von wem');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'auf' }))).toBe('worauf');
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_prep: 'von' }))).toBe('wovon');
  });

  test('the adverbial gaps', () => {
    expect(questionWord({ role: 'locative', animate: false }, verb())).toBe('wo');
    expect(questionWord({ role: 'manner', animate: false }, verb())).toBe('wie');
    expect(questionWord({ role: 'cause', animate: false }, verb())).toBe('warum');
  });
});
