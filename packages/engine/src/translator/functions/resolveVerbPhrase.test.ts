import { describe, expect, test } from 'vitest';
import type { VerbPhrase } from '@signi/shared';
import { CORRERE, lexicon, LOOKUP, MANGIARE, SEMPRE, VOLERE } from '../translator.fixtures.js';
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

  // A131: KNOW is "sapere" with no object and "conoscere" with one.
  describe('a verb with a sense for an object', () => {
    const SAPERE = { base: 'sapere', object_sense: 'KNOW_ACQUAINTED' };
    const CONOSCERE = { base: 'conoscere' };
    const KNOWING = lexicon({ KNOW: SAPERE, KNOW_ACQUAINTED: CONOSCERE, EAT: MANGIARE });

    test('resolves to that sense when it takes an object', () => {
      expect(resolveVerbPhrase({ verb: 'KNOW' }, 'it', KNOWING, undefined, undefined, true).verb)
        .toEqual({ conceptId: 'KNOW_ACQUAINTED', forms: CONOSCERE });
      expect(resolveVerbPhrase({ verb: 'KNOW' }, 'it', KNOWING, 'imperative', undefined, true).verb.conceptId).toBe('KNOW_ACQUAINTED');
    });

    test('keeps the verb itself with no object', () => {
      expect(resolveVerbPhrase({ verb: 'KNOW' }, 'it', KNOWING).verb).toEqual({ conceptId: 'KNOW', forms: SAPERE });
    });

    test('keeps the verb itself when the sense has no entry in the language, or the verb names no sense', () => {
      const unseeded = lexicon({ KNOW: SAPERE });
      expect(resolveVerbPhrase({ verb: 'KNOW' }, 'it', unseeded, undefined, undefined, true).verb).toEqual({ conceptId: 'KNOW', forms: SAPERE });
      expect(resolveVerbPhrase({ verb: 'EAT' }, 'it', KNOWING, undefined, undefined, true).verb).toEqual({ conceptId: 'EAT', forms: MANGIARE });
    });

    test('the modals are not swapped, only the verb', () => {
      const withModal = lexicon({ KNOW: SAPERE, KNOW_ACQUAINTED: CONOSCERE, WANT: { ...VOLERE, object_sense: 'KNOW_ACQUAINTED' } });
      const { verb, modals } = resolveVerbPhrase({ verb: 'KNOW', modals: ['WANT'] }, 'it', withModal, undefined, undefined, true);
      expect(verb.conceptId).toBe('KNOW_ACQUAINTED');
      expect(modals[0]!.verb.conceptId).toBe('WANT');
    });
  });

  // P09-E43: TELL is "raccontare" with a story and "dire" with an infinitive.
  describe('a verb with a sense for an infinitive', () => {
    const RACCONTARE = { base: 'raccontare', infinitive_sense: 'TELL_ORDER' };
    const DIRE = { base: 'dire', object_case: 'dat', infinitive_link: 'di' };
    const TELLING = lexicon({ TELL: RACCONTARE, TELL_ORDER: DIRE });

    test('resolves to that sense when the clause governs an infinitive, object or not', () => {
      expect(resolveVerbPhrase({ verb: 'TELL' }, 'it', TELLING, undefined, undefined, true, undefined, true).verb)
        .toEqual({ conceptId: 'TELL_ORDER', forms: DIRE });
      expect(resolveVerbPhrase({ verb: 'TELL' }, 'it', TELLING, undefined, undefined, false, undefined, true).verb.conceptId)
        .toBe('TELL_ORDER');
    });

    test('keeps the verb itself without one', () => {
      expect(resolveVerbPhrase({ verb: 'TELL' }, 'it', TELLING, undefined, undefined, true).verb)
        .toEqual({ conceptId: 'TELL', forms: RACCONTARE });
    });
  });
});
