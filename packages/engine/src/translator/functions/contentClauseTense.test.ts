import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { contentClauseTense } from './contentClauseTense.js';

const runs = (extra: Partial<VerbPhrase> = {}): VerbPhrase => ({ verb: 'RUN', ...extra });

describe('contentClauseTense', () => {
  test('under a past governor the indicative present becomes the past, the imperfect in the Romance languages', () => {
    for (const language of ['it', 'fr', 'es', 'pt']) {
      expect(contentClauseTense('past', language, undefined, runs())).toEqual({
        verbPhrase: runs({ tense: 'past' }), mood: undefined, imperfect: true,
      });
    }
    expect(contentClauseTense('past', 'en', undefined, runs())).toEqual({
      verbPhrase: runs({ tense: 'past' }), mood: undefined, imperfect: false,
    });
  });

  test('the present subjunctive becomes the imperfect subjunctive, except in French', () => {
    for (const language of ['it', 'es', 'pt']) {
      expect(contentClauseTense('past', language, 'presentSubjunctive', runs()).mood).toBe('subjunctive');
    }
    expect(contentClauseTense('past', 'fr', 'presentSubjunctive', runs()).mood).toBe('presentSubjunctive');
  });

  test('the future becomes the conditional, the perfect conditional in Italian', () => {
    for (const language of ['en', 'fr', 'es', 'pt']) {
      expect(contentClauseTense('past', language, undefined, runs({ tense: 'future' }))).toEqual({
        verbPhrase: runs({ tense: 'present' }), mood: 'conditional', imperfect: false,
      });
    }
    expect(contentClauseTense('past', 'it', undefined, runs({ tense: 'future' })).verbPhrase)
      .toEqual(runs({ tense: 'present', aspect: 'resultative' }));
    // A marked aspect keeps its own auxiliary and takes the simple conditional ("starebbe correndo").
    expect(contentClauseTense('past', 'it', undefined, runs({ tense: 'future', aspect: 'progressive' })).verbPhrase)
      .toEqual(runs({ tense: 'present', aspect: 'progressive' }));
  });

  test('unchanged: a present governor, German and Japanese, a past or resultative clause', () => {
    const present = runs();
    for (const governor of [undefined, 'present', 'future'] as const) {
      expect(contentClauseTense(governor, 'it', undefined, present)).toEqual({ verbPhrase: present, mood: undefined, imperfect: false });
    }
    for (const language of ['de', 'ja']) {
      expect(contentClauseTense('past', language, undefined, present).verbPhrase).toBe(present);
    }
    const past = runs({ tense: 'past' });
    expect(contentClauseTense('past', 'es', 'presentSubjunctive', past)).toEqual({ verbPhrase: past, mood: 'presentSubjunctive', imperfect: false });
    const resultative = runs({ aspect: 'resultative' });
    expect(contentClauseTense('past', 'en', undefined, resultative).verbPhrase).toBe(resultative);
    expect(contentClauseTense('past', 'en', undefined, undefined).verbPhrase).toBeUndefined();
  });

  test('under a governor that is not past, a past subjunctive clause is the perfect subjunctive (A260)', () => {
    for (const governor of [undefined, 'present', 'future'] as const) {
      expect(contentClauseTense(governor, 'es', 'presentSubjunctive', runs({ tense: 'past' }))).toEqual({
        verbPhrase: runs({ tense: 'present', aspect: 'resultative' }), mood: 'presentSubjunctive', imperfect: false,
      });
    }
    // A future keeps the present subjunctive, an indicative its past, and a marked aspect its own.
    const future = runs({ tense: 'future' });
    expect(contentClauseTense(undefined, 'it', 'presentSubjunctive', future).verbPhrase).toBe(future);
    const past = runs({ tense: 'past' });
    expect(contentClauseTense(undefined, 'it', undefined, past).verbPhrase).toBe(past);
    const prospective = runs({ tense: 'past', aspect: 'prospective' });
    expect(contentClauseTense(undefined, 'it', 'presentSubjunctive', prospective).verbPhrase).toBe(prospective);
  });

  test('under a governor that is not past, a past progressive takes the imperfect subjunctive, except in French (A262)', () => {
    const progressive = runs({ tense: 'past', aspect: 'progressive' });
    for (const language of ['it', 'es', 'pt']) {
      expect(contentClauseTense(undefined, language, 'presentSubjunctive', progressive)).toEqual({
        verbPhrase: runs({ tense: 'present', aspect: 'progressive' }), mood: 'subjunctive', imperfect: false,
      });
    }
    expect(contentClauseTense(undefined, 'fr', 'presentSubjunctive', progressive).verbPhrase).toBe(progressive);
    expect(contentClauseTense(undefined, 'it', undefined, progressive).verbPhrase).toBe(progressive);
  });
});
