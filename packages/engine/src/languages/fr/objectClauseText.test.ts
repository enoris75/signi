import { describe, expect, test } from 'vitest';
import { clause, np, vp } from '../resolved.fixtures.js';
import { objectClauseText } from './objectClauseText.js';

const chat = np({ base: 'chat' });
const mange = vp({ base: 'manger' });

describe('objectClauseText', () => {
  test('a statement opens on "que", eliding before a vowel', () => {
    expect(objectClauseText(clause(chat, mange), 'le chat mange')).toBe('que le chat mange');
    expect(objectClauseText(clause(chat, mange), 'il mange')).toBe("qu'il mange");
  });

  test('a yes/no question opens on "si", "s\'" before il and ils only', () => {
    const asked = clause(chat, mange, { embedded: true });
    expect(objectClauseText(asked, 'le chat mange')).toBe('si le chat mange');
    expect(objectClauseText(asked, 'il mange')).toBe("s'il mange");
    expect(objectClauseText(asked, 'ils mangent')).toBe("s'ils mangent");
    expect(objectClauseText(asked, 'elle mange')).toBe('si elle mange');
    expect(objectClauseText(asked, 'on mange')).toBe('si on mange');
  });

  test('a wh-question opens on its indirect word, and a subject one on nothing more', () => {
    const what = clause(chat, mange, { embedded: true, question: { role: 'directObject', animate: false } });
    expect(objectClauseText(what, 'le chat mange')).toBe('ce que le chat mange');
    expect(objectClauseText(what, 'il mange')).toBe("ce qu'il mange");
    const where = clause(chat, mange, { embedded: true, question: { role: 'locative', animate: false } });
    expect(objectClauseText(where, 'le chat mange')).toBe('où le chat mange');
    const subject = clause(chat, mange, { embedded: true, question: { role: 'subject', animate: false } });
    expect(objectClauseText(subject, 'ce qui mange')).toBe('ce qui mange');
  });
});
