import { describe, expect, test } from 'vitest';
import { contentClauseMood } from './contentClauseMood.js';

describe('contentClauseMood', () => {
  test("a governor declaring the subjunctive gets the language's present subjunctive (è giusto che si agisca)", () => {
    expect(contentClauseMood({ base: 'giusto', content_clause_mood: 'subjunctive' }, 'it', 'subject')).toBe('presentSubjunctive');
    expect(contentClauseMood({ base: 'pensare', content_clause_mood: 'subjunctive' }, 'it', 'object')).toBe('presentSubjunctive');
  });

  test('a language with no subjunctive stays indicative whatever the lexeme says', () => {
    expect(contentClauseMood({ base: 'right', content_clause_mood: 'subjunctive' }, 'en', 'subject')).toBeUndefined();
  });

  test('an object clause defaults to the indicative an assertion takes (dice che il gatto corre)', () => {
    expect(contentClauseMood({ base: 'dire' }, 'it', 'object')).toBeUndefined();
    expect(contentClauseMood(undefined, 'es', 'object')).toBeUndefined();
  });

  test('a subject clause falls back on the Romance subjunctive C30 shipped', () => {
    expect(contentClauseMood({ base: 'buono' }, 'it', 'subject')).toBe('presentSubjunctive');
    expect(contentClauseMood(undefined, 'fr', 'subject')).toBe('presentSubjunctive');
    expect(contentClauseMood(undefined, 'de', 'subject')).toBeUndefined();
  });

  test('a negated governor takes the mood it names under a negation (no cree que corra, A247)', () => {
    const creer = { base: 'creer', content_clause_mood_negative: 'subjunctive' };
    expect(contentClauseMood(creer, 'es', 'object', true)).toBe('presentSubjunctive');
    expect(contentClauseMood(creer, 'es', 'object', false)).toBeUndefined();
    expect(contentClauseMood(creer, 'es', 'object')).toBeUndefined();
  });

  test('a negated governor naming no negative mood keeps its affirmed one (no dice que corre)', () => {
    expect(contentClauseMood({ base: 'decir' }, 'es', 'object', true)).toBeUndefined();
    expect(contentClauseMood({ base: 'credere', content_clause_mood: 'subjunctive' }, 'it', 'object', true))
      .toBe('presentSubjunctive');
  });

  test('a governor declaring the indicative overrides the subject fallback', () => {
    expect(contentClauseMood({ base: 'vero', content_clause_mood: 'indicative' }, 'it', 'subject')).toBeUndefined();
  });
});
