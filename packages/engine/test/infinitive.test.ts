import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The infinitive is a MOOD occupying the finite slot, exactly as the imperative is: the verb
// takes its dictionary citation form and the subject is dropped. Unlike the imperative it is not
// a speech act — no one is addressed — so it carries no register and the subject's person is
// irrelevant. A plan supplies a throwaway GENERIC_PERSON subject purely to satisfy resolution;
// it is never rendered. Being a mood it forces present / neutral / modal-free (see the
// normalisation note below). This is what a verb's dictionary definition is phrased as.
const infinitive = (
  plan: Partial<PhrasePlan> = {},
  verbPhrase: Partial<VerbPhrase> = {},
): PhrasePlan => ({
  ...clause(np('GENERIC_PERSON'), 'EAT', { verbPhrase }),
  infinitive: true,
  ...plan,
});

describe('infinitive', () => {
  test('drops the subject and renders the citation form', () => {
    expect(sayAll(infinitive())).toEqual({
      en: 'to eat.',
      it: 'mangiare.',
      fr: 'manger.',
      es: 'comer.',
      pt: 'comer.',
      de: 'essen.',
      ja: '食べる。', // the plain dictionary form
    });
  });

  test('the object and complements still render', () => {
    expect(sayAll(infinitive({ directObject: np('FOOD') }))).toMatchObject({
      en: 'to eat the food.',
      it: 'mangiare il cibo.',
      de: 'das Essen essen.', // object-first, infinitive clause-final
      ja: '食べ物を食べる。',
    });

    expect(sayAll(infinitive({}, { modifier: 'FAST' }))).toMatchObject({
      en: 'to eat fast.',
      de: 'schnell essen.',
      ja: '速く食べる。',
    });

    expect(sayAll(infinitive({ complements: { locative: { phrase: np('HOUSE') } } })))
      .toMatchObject({
        en: 'to eat in the house.',
        it: 'mangiare nella casa.',
        ja: '家で食べる。',
      });
  });

  // The whole point of a dedicated mode: the citation form is NOT the imperative `instruction`
  // register. English prefixes "to" (the instruction's bare "eat"); Italian uses the true
  // infinitive "mangiare" (its instruction/imperative "mangia"); Japanese the dictionary form
  // 食べる (its instruction verbal noun 食べ). Only fr/es/pt/de coincide — expected, since those
  // languages already label controls with the infinitive.
  test('is a citation, distinct from the imperative instruction register', () => {
    const inf = sayAll(infinitive());
    expect(inf).toMatchObject({ en: 'to eat.', it: 'mangiare.', ja: '食べる。' });

    const instruction = sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT'),
      imperative: true,
      imperativeRegister: 'instruction',
    });
    expect(instruction).toMatchObject({ en: 'eat.', it: 'mangia.', ja: '食べ。' });
    // …but the four label-with-the-infinitive languages agree with the citation.
    expect(inf).toMatchObject({ fr: 'manger.', es: 'comer.', pt: 'comer.', de: 'essen.' });
  });

  test('the throwaway subject never surfaces — any subject renders the same', () => {
    expect(sayAll(infinitive({ subject: np('SECOND_PERSON') })))
      .toEqual(sayAll(infinitive()));
    expect(sayAll(infinitive({ subject: np('DOG') })))
      .toEqual(sayAll(infinitive()));
  });
});

describe('infinitive negation', () => {
  test('brackets the citation, not a finite verb', () => {
    expect(sayAll(infinitive({}, { negative: true }))).toMatchObject({
      en: 'not to eat.',
      it: 'non mangiare.',
      fr: 'ne pas manger.',
      es: 'no comer.',
      pt: 'não comer.',
      de: 'nicht essen.',
    });
  });

  // Japanese has no stored plain nai-form, so a negative citation falls back to the polite
  // negative 食べません — the same documented lexicon gap the relative-clause path lives with.
  test('Japanese falls back to the polite negative (documented nai-form gap)', () => {
    expect(sayAll(infinitive({}, { negative: true })).ja).toBe('食べません。');
  });
});

// A mood occupying the finite slot: a tensed / aspectual / modal infinitive is not meaningful.
// The UI forbids it; the translator normalises it anyway, so a stale or hand-built plan cannot
// feed one to the engines.
describe('infinitive normalisation', () => {
  test('tense, aspect and modals are all discarded', () => {
    const plain = sayAll(infinitive());
    expect(sayAll(infinitive({}, { tense: 'past' }))).toEqual(plain);
    expect(sayAll(infinitive({}, { aspect: 'progressive' }))).toEqual(plain);
    expect(sayAll(infinitive({}, { modals: ['MUST'] }))).toEqual(plain);
  });
});
