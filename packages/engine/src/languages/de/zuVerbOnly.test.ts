import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedPhrase } from '../../types.js';
import { zuVerbOnly } from './zuVerbOnly.js';

const subject = { agreement: {}, conjuncts: [] } as unknown as ResolvedNounElement;
const verb = { forms: { base: 'laufen' } } as never;
const aux = { forms: { base: 'werden' } } as never;

describe('zuVerbOnly', () => {
  test('keeps the verb, its voice and auxiliary, mood and tense', () => {
    const phrase: ResolvedPhrase = {
      subject,
      verbPhrase: { verb, modals: [], voice: 'passive', passiveAux: aux, mood: 'infinitive', tense: 'present' },
    };
    expect(zuVerbOnly(phrase)).toEqual(phrase);
  });

  test('drops objects, complements, adverbs, negation, modals and nested clauses', () => {
    const phrase = {
      subject,
      verbPhrase: { verb, modals: [{ verb }], negative: true, governedNegative: true, modifier: verb, mood: 'infinitive' },
      directObject: subject,
      agent: subject,
      complements: { comitative: {} },
      infinitiveComplement: { subject },
      purpose: { subject },
    } as unknown as ResolvedPhrase;
    expect(zuVerbOnly(phrase)).toEqual({ subject, verbPhrase: { verb, modals: [], mood: 'infinitive' } });
  });

  test('a verbless phrase keeps only its subject', () => {
    expect(zuVerbOnly({ subject, directObject: subject })).toEqual({ subject });
  });
});
