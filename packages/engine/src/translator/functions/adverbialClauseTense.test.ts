import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { adverbialClauseTense } from './adverbialClauseTense.js';

const eats: VerbPhrase = { verb: 'EAT', tense: 'future' };

describe('adverbialClauseTense', () => {
  test('a future temporal clause is in the present in English and German', () => {
    for (const conjunction of ['when', 'while', 'before'] as const) {
      for (const language of ['en', 'de']) {
        expect(adverbialClauseTense(conjunction, language, eats)).toEqual({ verb: 'EAT', tense: 'present' });
      }
    }
    expect(adverbialClauseTense('after', 'en', eats)).toEqual({ verb: 'EAT', tense: 'present' });
  });

  test('German "nachdem" takes the perfect, unless the clause has an aspect of its own', () => {
    expect(adverbialClauseTense('after', 'de', eats)).toEqual({ verb: 'EAT', tense: 'present', aspect: 'resultative' });
    expect(adverbialClauseTense('after', 'de', { ...eats, aspect: 'progressive' }))
      .toEqual({ verb: 'EAT', tense: 'present', aspect: 'progressive' });
  });

  test('because, another tense and the other languages are unchanged', () => {
    expect(adverbialClauseTense('because', 'en', eats)).toBe(eats);
    const past: VerbPhrase = { verb: 'EAT', tense: 'past' };
    expect(adverbialClauseTense('when', 'de', past)).toBe(past);
    for (const language of ['it', 'fr', 'es', 'pt', 'ja']) expect(adverbialClauseTense('when', language, eats)).toBe(eats);
  });
});
