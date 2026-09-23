import { describe, expect, test } from 'vitest';
import { questionSubject } from './questionSubject.js';

describe('questionSubject', () => {
  test('agrees in the third singular and has no word', () => {
    const subject = questionSubject({ role: 'subject', animate: false });
    expect(subject.agreement).toEqual({ person: '3', number: 'singular', gender: 'masc' });
    expect(subject.conjuncts[0].head.forms['base']).toBeUndefined();
    expect(subject.conjuncts[0].head.forms['person']).toBeUndefined();
  });

  test('carries the gap\'s animacy on its head', () => {
    expect(questionSubject({ role: 'subject', animate: true }).conjuncts[0].head.forms['animate']).toBe('1');
    expect(questionSubject({ role: 'subject', animate: false }).conjuncts[0].head.forms['animate']).toBeUndefined();
  });
});
