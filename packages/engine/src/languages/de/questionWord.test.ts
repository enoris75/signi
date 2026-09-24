import { describe, expect, test } from 'vitest';
import { questionWord } from './questionWord.js';

const verb = (forms: Record<string, string> = {}) => ({ conceptId: 'V', forms: { base: 'x', ...forms } });

describe('questionWord (de)', () => {
  test('wer declines for the slot it asks about; was does not', () => {
    expect(questionWord({ role: 'subject', animate: true }, verb())).toBe('wer');
    expect(questionWord({ role: 'directObject', animate: true }, verb())).toBe('wen');
    expect(questionWord({ role: 'directObject', animate: true }, verb({ object_case: 'dat' }))).toBe('wem');
    expect(questionWord({ role: 'subject', animate: false }, verb())).toBe('was');
    expect(questionWord({ role: 'directObject', animate: false }, verb())).toBe('was');
  });

  test('was has no dative: a thing in a dative slot asks with wem (A281)', () => {
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_case: 'dat' }))).toBe('wem');
    expect(questionWord({ role: 'terminus', animate: false }, verb({ terminus_dative: '1' }))).toBe('wem');
    // an inanimate goal of a verb without a dative terminus is a destination, not a recipient
    expect(questionWord({ role: 'terminus', animate: false }, verb())).toBe('in was');
    // fragen's addressee is accusative (`terminus_case`), so a thing there stays was
    expect(questionWord({ role: 'terminus', animate: false }, verb({ terminus_case: 'acc' }))).toBe('was');
    // the prepositional gaps keep the preposition's own word
    expect(questionWord({ role: 'directObject', animate: false }, verb({ object_case: 'dat', object_prep: 'auf' }))).toBe('worauf');
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

describe('questionWord (de): complement gaps (P09-E15)', () => {
  test('a thing is the wo(r)- compound where German has one, the preposition over was where not', () => {
    expect(questionWord({ role: 'locative', animate: false, specifiers: [{ kind: 'path', value: 'under' }] }, verb())).toBe('worunter');
    expect(questionWord({ role: 'instrumental', animate: false }, verb())).toBe('womit');
    expect(questionWord({ role: 'cause', animate: false, specifiers: [{ kind: 'sentiment', value: 'positive' }] }, verb())).toBe('dank was');
  });

  test('a person is the preposition over wer in its case, or the bare dative', () => {
    expect(questionWord({ role: 'cause', animate: true, specifiers: [{ kind: 'sentiment', value: 'positive' }] }, verb())).toBe('dank wem');
    expect(questionWord({ role: 'comitative', animate: true }, verb())).toBe('mit wem');
    expect(questionWord({ role: 'terminus', animate: true }, verb())).toBe('wem');
  });

  test('the negative cause is durch wessen Schuld, and the plain relations adverbs', () => {
    expect(questionWord({ role: 'cause', animate: true, specifiers: [{ kind: 'sentiment', value: 'negative' }] }, verb())).toBe('durch wessen Schuld');
    expect(questionWord({ role: 'direction', animate: false }, verb())).toBe('wohin');
    expect(questionWord({ role: 'source', animate: false }, verb())).toBe('woher');
    expect(questionWord({ role: 'temporal', animate: false }, verb())).toBe('wann');
    expect(questionWord({ role: 'temporal', animate: false, specifiers: [{ kind: 'temporal', value: 'until' }] }, verb())).toBe('bis wann');
  });
});
