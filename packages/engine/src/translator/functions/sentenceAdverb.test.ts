import { describe, expect, test } from 'vitest';
import { concept } from '../../languages/resolved.fixtures.js';
import type { ResolvedPhrase, ResolvedVerbPhrase } from '../../types.js';
import { asFrequencyAdverb, liftSentenceAdverb } from './sentenceAdverb.js';

const MAYBE = { base: 'maybe', subtype: 'sentence' };
const TALVEZ = { base: 'talvez', subtype: 'sentence', mood: 'subjunctive' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

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

  test('a question, a mood and an ordinary adverb stay where they are', () => {
    const asked = phrase({ modifier: asFrequencyAdverb(concept(MAYBE)), interrogative: true });
    expect(liftSentenceAdverb(asked)).toBe(asked);
    const conditional = phrase({ modifier: asFrequencyAdverb(concept(MAYBE)), mood: 'conditional' });
    expect(liftSentenceAdverb(conditional)).toBe(conditional);
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
