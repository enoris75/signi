import { describe, expect, test } from 'vitest';
import { concept } from '../../languages/resolved.fixtures.js';
import type { ResolvedPhrase, ResolvedVerbPhrase } from '../../types.js';
import { asFrequencyAdverb, liftSentenceAdverb, preverbalSentenceMood } from './sentenceAdverb.js';

const MAYBE = { base: 'maybe', subtype: 'sentence' };
const TALVEZ = { base: 'talvez', subtype: 'sentence', mood: 'subjunctive' };
const ALWAYS = { base: 'always', subtype: 'frequency' };
const TALVEZ_SLOT = { ...TALVEZ, negative_slot: 'pre-negator' };

const phrase = (vp: Partial<ResolvedVerbPhrase>): ResolvedPhrase => ({
  subject: { conjuncts: [], agreement: {} },
  verbPhrase: { verb: concept({ base: 'eat' }), modals: [], ...vp },
} as unknown as ResolvedPhrase);

describe('asFrequencyAdverb', () => {
  test('a sentence adverb resolves in the frequency slot, flagged', () => {
    expect(asFrequencyAdverb(concept(MAYBE))?.forms).toEqual({ base: 'maybe', subtype: 'frequency', sentence: '1' });
  });

  test('any other adverb is untouched', () => {
    expect(asFrequencyAdverb(concept(ALWAYS))?.forms).toEqual(ALWAYS);
    expect(asFrequencyAdverb(undefined)).toBeUndefined();
  });
});

describe('liftSentenceAdverb', () => {
  test('a statement moves it out of the verb phrase, with its own subtype back', () => {
    const lifted = liftSentenceAdverb(phrase({ modifier: asFrequencyAdverb(concept(MAYBE)) }));
    expect(lifted.sentenceAdverb?.forms).toEqual(MAYBE);
    expect(lifted.verbPhrase?.modifier).toBeUndefined();
  });

  test('a question, a clause with a mood of its own and an ordinary adverb stay where they are', () => {
    const asked = phrase({ modifier: asFrequencyAdverb(concept(MAYBE)), interrogative: true });
    expect(liftSentenceAdverb(asked)).toBe(asked);
    const conditional = phrase({ modifier: asFrequencyAdverb(concept(MAYBE)), mood: 'conditional' });
    expect(liftSentenceAdverb(conditional, 'conditional')).toBe(conditional);
    const always = phrase({ modifier: concept(ALWAYS) });
    expect(liftSentenceAdverb(always)).toBe(always);
  });

  test('a lexeme naming the subjunctive puts the clause in it, a past event in the perfect', () => {
    const lift = (vp: Partial<ResolvedVerbPhrase>) =>
      liftSentenceAdverb(phrase({ modifier: asFrequencyAdverb(concept(TALVEZ)), ...vp })).verbPhrase;
    expect(lift({})).toMatchObject({ mood: 'presentSubjunctive', tense: 'present' });
    expect(lift({ tense: 'past' })).toMatchObject({ mood: 'presentSubjunctive', tense: 'present', aspect: 'resultative' });
    expect(lift({ tense: 'past', aspect: 'resultative' })).toMatchObject({ mood: 'subjunctive', tense: 'past' });
  });
});

describe('preverbalSentenceMood', () => {
  const vp = (extra: Partial<ResolvedVerbPhrase>) => phrase({ modifier: asFrequencyAdverb(concept(TALVEZ_SLOT)), ...extra }).verbPhrase!;

  test('ahead of the negator it precedes the verb, which takes the subjunctive', () => {
    expect(preverbalSentenceMood(vp({ negative: true }))).toEqual({ mood: 'presentSubjunctive', tense: 'present' });
    expect(preverbalSentenceMood(vp({ negative: true, tense: 'past' })))
      .toEqual({ mood: 'presentSubjunctive', tense: 'present', aspect: 'resultative' });
  });

  test('affirmative, in a mood of its own, under a modal, or asking for no mood, it is left alone', () => {
    expect(preverbalSentenceMood(vp({}))).toEqual({});
    expect(preverbalSentenceMood(vp({ negative: true, mood: 'conditional' }))).toEqual({});
    expect(preverbalSentenceMood(vp({ negative: true, modals: [{ verb: concept({ base: 'poder' }) }] }))).toEqual({});
    expect(preverbalSentenceMood(phrase({ modifier: asFrequencyAdverb(concept(MAYBE)), negative: true }).verbPhrase!)).toEqual({});
  });
});
