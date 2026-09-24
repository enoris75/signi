import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import type { LexiconLookup } from '../translator.types.js';
import { addresseeObject } from './addresseeObject.js';

const FORMS: Record<string, Record<string, string>> = {
  TELL: { base: 'tell', complements: 'manner,terminus,cause' },
  THINK: { base: 'think', complements: 'manner,cause' },
  DOG: { base: 'dog' },
  SECOND_PERSON: { base: 'you', person: '2' },
};
const lookup: LexiconLookup = (conceptId, language) =>
  FORMS[conceptId] ? { conceptId, language: language as 'en', forms: FORMS[conceptId] } : undefined;

const runs = { subject: { concept: 'CAT' }, verbPhrase: { verb: 'RUN' } };
const tells = (extra: Partial<PhrasePlan> = {}, verb = 'TELL'): PhrasePlan =>
  ({ subject: { concept: 'MAN' }, verbPhrase: { verb }, directObject: { concept: 'DOG' }, contentObject: runs, ...extra });

// A317
describe('addresseeObject', () => {
  test('beside a content clause, the object moves into the terminus the verb licenses', () => {
    const out = addresseeObject(tells(), 'de', lookup);
    expect(out.directObject).toBeUndefined();
    expect(out.complements?.terminus).toEqual({ phrase: { concept: 'DOG' } });
    expect(out.contentObject).toBe(runs);
  });

  test('untouched: no content clause, a terminus already named, a passive, a verb with no terminus', () => {
    for (const plan of [
      tells({ contentObject: undefined }),
      tells({ complements: { terminus: { phrase: { concept: 'DOG' } } } }),
      tells({ verbPhrase: { verb: 'TELL', voice: 'passive' } }),
      tells({}, 'THINK'),
    ]) {
      expect(addresseeObject(plan, 'de', lookup)).toBe(plan);
    }
  });

  test('a Romance 1st- or 2nd-person clitic stays, as it is the addressee already; German routes it', () => {
    const you = tells({ directObject: { concept: 'SECOND_PERSON' } });
    for (const language of ['it', 'fr', 'es', 'pt']) expect(addresseeObject(you, language, lookup)).toBe(you);
    expect(addresseeObject(you, 'de', lookup).complements?.terminus).toEqual({ phrase: { concept: 'SECOND_PERSON' } });
  });
});
