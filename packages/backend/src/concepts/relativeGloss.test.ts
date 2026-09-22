import { describe, expect, test } from 'vitest';
import { translate } from '@signi/engine';
import type { PhrasePlan } from '@signi/shared';
import { lookupLexicalEntry } from '../lexicon.js';
import { namedAgentGloss, relativeGloss, stateGloss, subjectGapGloss } from './relativeGloss.js';
// Seeds the real corpus into this file's in-memory database (SIGNI_DB_PATH, see vitest.config.ts),
// so the examples in the helpers' comments are checked against the engine, not just their plans.
import '../seed.js';

/** Every language's rendering, without the full stop, keyed — as a definition tooltip shows it. */
const renders = (plan: PhrasePlan): Record<string, string> =>
  Object.fromEntries(translate(plan, lookupLexicalEntry).map((t) => [t.language, t.text.replace(/[.。]$/, '')]));

const GENERIC = { concept: 'GENERIC_PERSON' };
const inTheHouse = { locative: { phrase: { concept: 'HOUSE', definiteness: 'definite' as const } } };

describe('relativeGloss', () => {
  test('flags an indefinite antecedent to say its relative alone', () => {
    const relative = { verbPhrase: { verb: 'LIVE' } };
    expect(relativeGloss('ANIMAL', relative)).toEqual({
      subject: { concept: 'ANIMAL', definiteness: 'indefinite', relative, relativeGloss: true },
    });
  });

  test('takes the antecedent\'s number', () => {
    expect(relativeGloss('PERSON', { verbPhrase: { verb: 'LIVE' } }, 'plural').subject).toMatchObject({ number: 'plural' });
  });

  test('renders the example in its comment', () => {
    const plan = relativeGloss('OBJECT_THING', {
      headRole: 'directObject', subject: GENERIC, verbPhrase: { verb: 'SAVE', aspect: 'resultative' },
    });
    expect(renders(plan)).toEqual({
      en: 'that one has saved', it: 'che si è salvato', fr: "qu'on a enregistré", de: 'den man gespeichert hat',
      es: 'que se ha guardado', ja: '保存した', pt: 'que se salvou',
    });
  });
});

describe('stateGloss', () => {
  test('is an object gap on the generic "one", in the resultative', () => {
    expect(stateGloss('OBJECT_THING', 'SAVE')).toEqual({
      subject: {
        concept: 'OBJECT_THING',
        definiteness: 'indefinite',
        relative: { headRole: 'directObject', subject: GENERIC, verbPhrase: { verb: 'SAVE', aspect: 'resultative' } },
        relativeGloss: true,
      },
    });
  });

  test('another aspect, a tense, a voice, modals, negation, an adverb and complements reach the clause', () => {
    const recipient = { terminus: { phrase: { concept: 'PERSON', definiteness: 'indefinite' as const } } };
    expect(stateGloss('OBJECT_THING', 'GIVE', {
      aspect: 'neutral', tense: 'past', voice: 'passive', modals: ['CAN'], negative: true, modifier: 'ALWAYS', complements: recipient,
    }).subject).toMatchObject({
      relative: {
        headRole: 'directObject',
        verbPhrase: { verb: 'GIVE', aspect: 'neutral', tense: 'past', voice: 'passive', modals: ['CAN'], negative: true, modifier: 'ALWAYS' },
        complements: recipient,
      },
    });
  });

  test('the antecedent\'s number is the antecedent\'s, not the clause\'s', () => {
    const { subject } = stateGloss('OBJECT_THING', 'SAVE', { antecedentNumber: 'plural' });
    expect(subject).toMatchObject({ concept: 'OBJECT_THING', number: 'plural' });
    expect(subject).not.toHaveProperty('relative.antecedentNumber');
    expect(subject).not.toHaveProperty('relative.directObject');
  });

  test('renders the examples in its comment', () => {
    expect(renders(stateGloss('OBJECT_THING', 'SAVE'))).toEqual({
      en: 'that one has saved', it: 'che si è salvato', fr: "qu'on a enregistré", de: 'den man gespeichert hat',
      es: 'que se ha guardado', ja: '保存した', pt: 'que se salvou',
    });
    expect(renders(stateGloss('OBJECT_THING', 'SAVE', { negative: true }))).toMatchObject({
      en: 'that one has not saved', de: 'den man nicht gespeichert hat', ja: '保存していない',
    });
    expect(renders(stateGloss('OBJECT_THING', 'KNOW', { aspect: 'neutral', negative: true }))).toMatchObject({
      en: 'that one does not know', fr: "qu'on ne connaît pas", de: 'den man nicht kennt', ja: '知らない',
    });
    expect(renders(stateGloss('OBJECT_THING', 'SEE', { aspect: 'neutral', modals: ['CAN'] }))).toMatchObject({
      en: 'that one can see', it: 'che si può vedere', de: 'den man sehen kann', ja: '見ることができる',
    });
    // Why a modal one wants the neutral aspect: the resultative puts it in the past.
    expect(renders(stateGloss('OBJECT_THING', 'SEE', { modals: ['CAN'] })).en).toBe('that one can have seen');
  });

  test('the passive says the state of the thing itself', () => {
    expect(renders(stateGloss('OBJECT_THING', 'SAVE', { voice: 'passive' }))).toEqual({
      en: 'that has been saved', it: 'che è stato salvato', fr: 'qui a été enregistré', de: 'der gespeichert worden ist',
      es: 'que ha sido guardado', ja: '保存された', pt: 'que foi salvo',
    });
  });
});

describe('subjectGapGloss', () => {
  test('is a subject gap: the clause takes an object, its determiner and number, and negation', () => {
    expect(subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'NAME_NOUN', number: 'plural', negative: true })).toEqual({
      subject: {
        concept: 'OBJECT_THING',
        definiteness: 'indefinite',
        relative: {
          verbPhrase: { verb: 'HAVE', negative: true },
          directObject: { concept: 'NAME_NOUN', definiteness: 'bare', number: 'plural' },
        },
        relativeGloss: true,
      },
    });
  });

  test('a predicate adjective and its degree join the complements', () => {
    expect(subjectGapGloss('OBJECT_THING', 'BE', { predicate: 'SMALL', predicateDegree: 'more' }).subject).toMatchObject({
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: { concept: 'SMALL', headDegree: 'more' } } } },
    });
  });

  test('renders the examples in its comment', () => {
    expect(renders(subjectGapGloss('ANIMAL', 'LIVE', { complements: inTheHouse }))).toMatchObject({
      en: 'that lives in the house', it: 'che abita nella casa', de: 'das im Haus wohnt', ja: '家に住む',
    });
    expect(renders(subjectGapGloss('OBJECT_THING', 'HAVE', { object: 'NAME_NOUN', number: 'plural', negative: true }))).toMatchObject({
      en: 'that does not have names', fr: "qui n'a pas de noms", de: 'der keine Namen hat', ja: '名前がない',
    });
    expect(renders(subjectGapGloss('SUBSTANCE', 'BE', { predicate: 'SOLID', negative: true }))).toMatchObject({
      en: 'that is not solid', it: 'che non è solida', de: 'der nicht fest ist', ja: '固体ではない',
    });
    expect(renders(subjectGapGloss('WORD', 'INDICATE', { object: 'SPEAKER', definiteness: 'definite' }))).toMatchObject({
      en: 'that indicates the speaker', de: 'das den Sprecher bezeichnet', ja: '話し手を示す',
    });
    expect(renders(subjectGapGloss('PERSON', 'LIVE', { complements: inTheHouse }))).toMatchObject({
      en: 'who lives in the house', de: 'die im Haus wohnt',
    });
  });
});

describe('namedAgentGloss', () => {
  test('is an object gap with an indefinite named agent, and no aspect of its own', () => {
    expect(namedAgentGloss('OBJECT_THING', 'GOVERN', 'VERB')).toEqual({
      subject: {
        concept: 'OBJECT_THING',
        definiteness: 'indefinite',
        relative: { headRole: 'directObject', subject: { concept: 'VERB', definiteness: 'indefinite' }, verbPhrase: { verb: 'GOVERN' } },
        relativeGloss: true,
      },
    });
  });

  test('the agent may carry its own determiner, number and adjectives', () => {
    expect(namedAgentGloss('WORD', 'INDICATE', { concept: 'SPEAKER', definiteness: 'definite', number: 'plural', adjectives: ['OLD'] }).subject)
      .toMatchObject({ relative: { subject: { concept: 'SPEAKER', definiteness: 'definite', number: 'plural', adjectives: ['OLD'] } } });
  });

  test('renders the examples in its comment', () => {
    expect(renders(namedAgentGloss('OBJECT_THING', 'GOVERN', 'VERB'))).toEqual({
      en: 'that a verb governs', it: 'che un verbo regge', fr: "qu'un verbe régit", de: 'den ein Verb regiert',
      es: 'que un verbo rige', ja: '動詞が支配する', pt: 'que um verbo rege',
    });
    expect(renders(namedAgentGloss('WORD', 'INDICATE', { concept: 'SPEAKER', definiteness: 'definite' }))).toMatchObject({
      en: 'that the speaker indicates', de: 'das der Sprecher bezeichnet',
    });
  });
});
