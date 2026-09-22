import { describe, expect, test } from 'vitest';
import { causativeGloss, glossClause, infinitiveGloss } from './gloss.js';

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

  test('a negated clause marks its verb phrase', () => {
    expect(infinitiveGloss('ACT', { negative: true }).verbPhrase).toEqual({ verb: 'ACT', negative: true });
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

describe('causativeGloss', () => {
  test('the causee is the object, and what it comes to do the object-controlled complement', () => {
    expect(causativeGloss(
      { object: 'PERSON', definiteness: 'indefinite' },
      { verb: 'SEE', object: 'OBJECT_THING', number: 'plural' },
    )).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'CAUSE_VERB' },
      directObject: { concept: 'PERSON', definiteness: 'indefinite' },
      infinitiveComplement: {
        verbPhrase: { verb: 'SEE' },
        directObject: { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural' },
        control: 'object',
      },
      infinitive: true,
    });
  });

  test('the caused clause takes a predicate adjective, its degree and its negation', () => {
    expect(causativeGloss({ object: 'OBJECT_THING' }, { verb: 'BECOME', predicate: 'SMALL', predicateDegree: 'more' }).infinitiveComplement)
      .toEqual({
        verbPhrase: { verb: 'BECOME' },
        complements: { predicative: { phrase: { concept: 'SMALL', headDegree: 'more' } } },
        control: 'object',
      });
    expect(causativeGloss({ object: 'OBJECT_THING' }, { verb: 'BE', predicate: 'VISIBLE', negative: true }).infinitiveComplement)
      .toEqual({
        verbPhrase: { verb: 'BE', negative: true },
        complements: { predicative: { phrase: { concept: 'VISIBLE' } } },
        control: 'object',
      });
  });

  test('a causee with no determiner of its own renders bare, as any gloss object does', () => {
    expect(causativeGloss({ object: 'PERSON', number: 'plural' }, { verb: 'ACT', modifier: 'TOGETHER' })).toEqual({
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'CAUSE_VERB' },
      directObject: { concept: 'PERSON', definiteness: 'bare', number: 'plural' },
      infinitiveComplement: { verbPhrase: { verb: 'ACT', modifier: 'TOGETHER' }, control: 'object' },
      infinitive: true,
    });
  });
});

describe('glossClause', () => {
  // A relative gloss's clause is said of something, so it has a tense, an aspect, a voice and modals
  // to give its verb; a verb's citation has none, and its verb phrase stays exactly what it was.
  test('tense, aspect, voice and modals reach the verb phrase when given, and only then', () => {
    expect(glossClause('SEE', { tense: 'past', aspect: 'resultative', voice: 'passive', modals: ['CAN'] }).verbPhrase).toEqual({
      verb: 'SEE', tense: 'past', aspect: 'resultative', voice: 'passive', modals: ['CAN'],
    });
    expect(glossClause('SEE', { modals: [] }).verbPhrase).toEqual({ verb: 'SEE' });
    expect(glossClause('SEE', { object: 'OBJECT_THING', negative: true }).verbPhrase).toEqual({ verb: 'SEE', negative: true });
  });
});
