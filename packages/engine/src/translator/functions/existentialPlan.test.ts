import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { existentialPlan } from './existentialPlan.js';

const aCat = { concept: 'CAT', definiteness: 'indefinite' as const };
const plan = (extra: Partial<PhrasePlan> = {}, verbPhrase: PhrasePlan['verbPhrase'] = { verb: 'BE' }): PhrasePlan => ({
  subject: aCat, verbPhrase, existential: true, ...extra,
});

describe('existentialPlan', () => {
  test('the pivot becomes the object of each language\'s existential verb, under an impersonal subject', () => {
    expect(existentialPlan(plan(), 'de')).toEqual({
      subject: { concept: 'THIRD_PERSON', gender: 'neut' }, verbPhrase: { verb: 'GIVE' }, directObject: aCat,
    });
    expect(existentialPlan(plan(), 'fr').verbPhrase?.verb).toBe('HAVE');
    expect(existentialPlan(plan(), 'fr').subject).toEqual({ concept: 'THIRD_PERSON', gender: 'masc' });
    for (const language of ['en', 'it', 'ja']) expect(existentialPlan(plan(), language).verbPhrase?.verb).toBe('BE');
    for (const language of ['es', 'pt']) expect(existentialPlan(plan(), language).verbPhrase?.verb).toBe('HAVE');
  });

  test('the plan\'s own object is dropped, and its complements and tense are kept', () => {
    const locative = { phrase: { concept: 'HOUSE' } };
    const result = existentialPlan(plan({ directObject: { concept: 'DOG' }, complements: { locative } }, { verb: 'BE', tense: 'past' }), 'it');
    expect(result.directObject).toEqual(aCat);
    expect(result.complements).toEqual({ locative });
    expect(result.verbPhrase).toEqual({ verb: 'BE', tense: 'past' });
    expect(result.existential).toBeUndefined();
  });

  test('English says a negated indefinite pivot as "no", unless a modal carries the negation', () => {
    expect(existentialPlan(plan({}, { verb: 'BE', negative: true }), 'en'))
      .toMatchObject({ directObject: { concept: 'CAT', definiteness: 'no' }, verbPhrase: { verb: 'BE', negative: false } });
    expect(existentialPlan(plan({}, { verb: 'BE', negative: true, modals: ['CAN'] }), 'en'))
      .toMatchObject({ directObject: aCat, verbPhrase: { negative: true } });
    expect(existentialPlan(plan({ subject: { concept: 'CAT' } }, { verb: 'BE', negative: true }), 'en').directObject)
      .toEqual({ concept: 'CAT' });
    expect(existentialPlan(plan({}, { verb: 'BE', negative: true }), 'fr'))
      .toMatchObject({ directObject: aCat, verbPhrase: { negative: true } });
  });

  test('a pivot that is already "no" is not negated twice', () => {
    const noCat = { concept: 'CAT', definiteness: 'no' as const };
    for (const language of ['en', 'it', 'ja']) {
      expect(existentialPlan(plan({ subject: noCat }, { verb: 'BE', negative: true }), language).verbPhrase?.negative).toBe(false);
    }
  });

  test('what has no existential reading is refused', () => {
    expect(() => existentialPlan(plan({}, { verb: 'EAT' }), 'en')).toThrow(/BE/);
    expect(() => existentialPlan({ subject: aCat, existential: true }, 'en')).toThrow(/verb phrase/);
    expect(() => existentialPlan(plan({ questionRole: 'locative' }), 'en')).toThrow(/wh-question/);
    expect(() => existentialPlan(plan({}, { verb: 'BE', voice: 'passive' }), 'en')).toThrow(/passive/);
    expect(() => existentialPlan(plan(), 'en', 'imperative')).toThrow(/imperative/);
    expect(() => existentialPlan(plan(), 'en', 'infinitive')).toThrow(/infinitive/);
  });
});
