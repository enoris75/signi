import { describe, expect, test } from 'vitest';
import { SUBORDINATING_CONJUNCTIONS } from '@signi/shared';
import { adverbialClauseMood } from './adverbialClauseMood.js';

describe('adverbialClauseMood', () => {
  // P09-E27: until and though govern the subjunctive in some languages only (below).
  test.each(SUBORDINATING_CONJUNCTIONS.filter((c) => !['before', 'until', 'though'].includes(c)))('%s takes the indicative', (conjunction) => {
    for (const language of ['en', 'it', 'fr', 'de', 'es', 'pt', 'ja']) {
      expect(adverbialClauseMood(conjunction, language, 'present')).toBeUndefined();
    }
  });

  test('before governs the present subjunctive in the four Romance languages', () => {
    for (const language of ['it', 'fr', 'es', 'pt']) {
      expect(adverbialClauseMood('before', language, 'present')).toBe('presentSubjunctive');
    }
    for (const language of ['en', 'de', 'ja']) {
      expect(adverbialClauseMood('before', language, 'present')).toBeUndefined();
    }
  });

  test('a past event under before takes the imperfect subjunctive, except in French', () => {
    expect(adverbialClauseMood('before', 'it', 'past')).toBe('subjunctive');
    expect(adverbialClauseMood('before', 'es', 'past')).toBe('subjunctive');
    expect(adverbialClauseMood('before', 'pt', 'past')).toBe('subjunctive');
    expect(adverbialClauseMood('before', 'fr', 'past')).toBe('presentSubjunctive');
    expect(adverbialClauseMood('before', 'en', 'past')).toBeUndefined();
  });

  test('a future event under a temporal conjunction is subjunctive in Spanish and Portuguese', () => {
    for (const conjunction of ['when', 'while', 'after'] as const) {
      expect(adverbialClauseMood(conjunction, 'es', 'future')).toBe('presentSubjunctive');
      expect(adverbialClauseMood(conjunction, 'pt', 'future')).toBe('futureSubjunctive');
      for (const language of ['en', 'it', 'fr', 'de', 'ja']) {
        expect(adverbialClauseMood(conjunction, language, 'future')).toBeUndefined();
      }
    }
    expect(adverbialClauseMood('before', 'es', 'future')).toBe('presentSubjunctive');
    expect(adverbialClauseMood('before', 'pt', 'future')).toBe('presentSubjunctive');
  });

  // P09-E27 D1: jusqu'à ce que / hasta que / até que govern the subjunctive; Italian finché keeps the
  // indicative under its expletive non.
  test('until governs the subjunctive in French, Spanish and Portuguese, not Italian', () => {
    for (const language of ['fr', 'es', 'pt']) expect(adverbialClauseMood('until', language, 'present')).toBe('presentSubjunctive');
    for (const language of ['en', 'it', 'de', 'ja']) expect(adverbialClauseMood('until', language, 'present')).toBeUndefined();
    expect(adverbialClauseMood('until', 'es', 'past')).toBe('subjunctive');
    expect(adverbialClauseMood('until', 'fr', 'past')).toBe('presentSubjunctive');
  });

  // D4: sebbene / bien que / embora govern the subjunctive; Spanish aunque asserts its clause.
  test('though governs the subjunctive in Italian, French and Portuguese, not Spanish', () => {
    for (const language of ['it', 'fr', 'pt']) expect(adverbialClauseMood('though', language, 'present')).toBe('presentSubjunctive');
    for (const language of ['en', 'de', 'es', 'ja']) expect(adverbialClauseMood('though', language, 'present')).toBeUndefined();
    expect(adverbialClauseMood('though', 'it', 'past')).toBe('subjunctive');
  });

  // D2: since looks back, and though concedes a fact, so neither is a temporal conjunction that
  // defers a future; until is one.
  test('a future under since or though keeps the indicative, under until it does not', () => {
    for (const conjunction of ['since', 'though'] as const) {
      expect(adverbialClauseMood(conjunction, 'es', 'future')).toBeUndefined();
    }
    expect(adverbialClauseMood('until', 'es', 'future')).toBe('presentSubjunctive');
    expect(adverbialClauseMood('until', 'it', 'future')).toBeUndefined();
  });

  test('because keeps the future indicative', () => {
    expect(adverbialClauseMood('because', 'es', 'future')).toBeUndefined();
    expect(adverbialClauseMood('because', 'pt', 'future')).toBeUndefined();
  });
});
