import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { CORRERE, LOOKUP, MANGIARE, SEMPRE, VOLERE } from '../translator.fixtures.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';

const PAST_PROGRESSIVE: VerbPhrase = { verb: 'EAT', tense: 'past', aspect: 'progressive', modals: ['WANT'] };

describe('resolveVerbPhrase', () => {
  test('resolves the verb with its polarity, tense and aspect, in no mood and no register', () => {
    expect(resolveVerbPhrase({ verb: 'EAT', negative: true, tense: 'past', aspect: 'progressive' }, 'it', LOOKUP)).toEqual({
      verb: { conceptId: 'EAT', forms: MANGIARE },
      negative: true,
      tense: 'past',
      aspect: 'progressive',
      mood: undefined,
      register: undefined,
      modifier: undefined,
      modals: [],
    });
  });

  test("resolves the main verb's adverb", () => {
    expect(resolveVerbPhrase({ verb: 'EAT', modifier: 'ALWAYS' }, 'it', LOOKUP).modifier).toEqual({ conceptId: 'ALWAYS', forms: SEMPRE });
  });

  test('resolves each modal outermost first, a bare id being a modal with no adverb of its own', () => {
    const { modals } = resolveVerbPhrase({ verb: 'EAT', modals: ['WANT', { verb: 'WANT', modifier: 'ALWAYS' }, { verb: 'RUN' }] }, 'it', LOOKUP);
    expect(modals).toEqual([
      { verb: { conceptId: 'WANT', forms: VOLERE }, modifier: undefined },
      { verb: { conceptId: 'WANT', forms: VOLERE }, modifier: { conceptId: 'ALWAYS', forms: SEMPRE } },
      { verb: { conceptId: 'RUN', forms: CORRERE }, modifier: undefined },
    ]);
  });

  test('a conditional keeps its tense, aspect and modals, and takes no register', () => {
    expect(resolveVerbPhrase(PAST_PROGRESSIVE, 'it', LOOKUP, 'conditional', 'instruction')).toMatchObject({
      mood: 'conditional', tense: 'past', aspect: 'progressive', register: undefined,
    });
    expect(resolveVerbPhrase(PAST_PROGRESSIVE, 'it', LOOKUP, 'conditional').modals).toHaveLength(1);
  });

  test('an imperative is present, neutral and modal-free, and a request unless told otherwise', () => {
    const command = resolveVerbPhrase(PAST_PROGRESSIVE, 'it', LOOKUP, 'imperative');
    expect(command).toMatchObject({ mood: 'imperative', tense: 'present', aspect: 'neutral', modals: [], register: 'request' });
    expect(resolveVerbPhrase(PAST_PROGRESSIVE, 'it', LOOKUP, 'imperative', 'instruction').register).toBe('instruction');
  });

  test('an infinitive takes the finite slot the same way, but carries no register', () => {
    expect(resolveVerbPhrase(PAST_PROGRESSIVE, 'it', LOOKUP, 'infinitive', 'instruction')).toMatchObject({
      mood: 'infinitive', tense: 'present', aspect: 'neutral', modals: [], register: undefined,
    });
  });
});
