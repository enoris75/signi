import { describe, expect, test } from 'vitest';
import { SUBORDINATING_CONJUNCTIONS } from '@signi/shared';
import { adverbialClauseMood } from './adverbialClauseMood.js';

describe('adverbialClauseMood', () => {
  test.each(SUBORDINATING_CONJUNCTIONS.filter((c) => c !== 'before'))('%s takes the indicative', (conjunction) => {
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
});
