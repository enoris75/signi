import { describe, expect, test } from 'vitest';
import { infinitiveGloss } from './gloss.js';

describe('infinitiveGloss', () => {
  test('a bare genus verb is a subject-less infinitive with no object', () => {
    expect(infinitiveGloss('STRIKE')).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'STRIKE' },
      infinitive: true,
    });
  });

  test('an object given as a string renders bare and singular', () => {
    expect(infinitiveGloss('CONSUME', 'FOOD')).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'CONSUME' },
      directObject: { concept: 'FOOD', definiteness: 'bare' },
      infinitive: true,
    });
  });

  test('the positional number and adjectives narrow a string object', () => {
    expect(infinitiveGloss('UNDERSTAND', 'WORD', 'plural', ['WRITTEN']).directObject).toEqual({
      concept: 'WORD',
      definiteness: 'bare',
      number: 'plural',
      adjectives: ['WRITTEN'],
    });
  });

  test('an empty adjective list is left off the object', () => {
    expect(infinitiveGloss('CREATE', 'OBJECT_THING', 'plural', []).directObject).toEqual({
      concept: 'OBJECT_THING',
      definiteness: 'bare',
      number: 'plural',
    });
  });

  test('parts carry the object, its determiner, the complements and a modifier', () => {
    const complements = {
      instrumental: { phrase: { concept: 'MONEY', definiteness: 'bare' as const } },
    };
    expect(
      infinitiveGloss('ACQUIRE', {
        object: 'BUTTON',
        definiteness: 'indefinite',
        adjectives: ['RED'],
        complements,
        modifier: 'REPEATEDLY',
      }),
    ).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'ACQUIRE', modifier: 'REPEATEDLY' },
      directObject: { concept: 'BUTTON', definiteness: 'indefinite', adjectives: ['RED'] },
      complements,
      infinitive: true,
    });
  });

  test('parts without an object keep only what they name', () => {
    expect(infinitiveGloss('STRIKE', { modifier: 'REPEATEDLY' })).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'STRIKE', modifier: 'REPEATEDLY' },
      infinitive: true,
    });
  });

  test('parts ignore the positional number and adjectives', () => {
    expect(infinitiveGloss('CONSUME', { object: 'FOOD' }, 'plural', ['HOT']).directObject).toEqual({
      concept: 'FOOD',
      definiteness: 'bare',
    });
  });

  test('a governed verb becomes the infinitive complement', () => {
    expect(infinitiveGloss('DESIRE', { infinitive: 'ACT' })).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'DESIRE' },
      infinitiveComplement: { verbPhrase: { verb: 'ACT' } },
      infinitive: true,
    });
  });

  test('a predicate adjective joins the complements, and a whole clause may be governed', () => {
    const eatFood = { verbPhrase: { verb: 'EAT' }, directObject: { concept: 'FOOD' } };
    expect(infinitiveGloss('BE', { predicate: 'ABLE', infinitive: eatFood })).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: { concept: 'ABLE' } } },
      infinitiveComplement: eatFood,
      infinitive: true,
    });
  });
});
