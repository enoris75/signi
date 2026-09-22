import { describe, expect, test } from 'vitest';
import {
  adj, ALWAYS, BE, BIG, BOOK, CAN, CAT, clause, complement, complements, DOG, EAT, el, FOOD, GIVE, GOOD, GREAT, group, HAPPY, HE, HIGH,
  I, modal, MOUSE, MUST, np, ONE, RUN, SEEM, SIZE, SPEED, vp, WAY, WE, YOU,
} from './en.fixtures.js';
import { renderClause } from './renderClause.js';

const mouse = el(np(MOUSE));

describe('renderClause', () => {
  describe('verbless periods', () => {
    test('a bare noun phrase stands on its own', () => {
      expect(renderClause(clause(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BIG)] })))).toBe('a big cat');
      expect(renderClause(clause(np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } })))).toBe('the cat that eats');
    });

    test('a dimension gloss is a prepositional fragment', () => {
      expect(renderClause(clause(np(SIZE, { definiteness: 'bare' }, { adjectives: [adj(GREAT)], dimensionGloss: true })))).toBe('of great size');
    });

    test('a manner gloss is the adverbial its manner relation picks', () => {
      expect(renderClause(clause(np(SPEED, { definiteness: 'bare' }, { adjectives: [adj(HIGH)], mannerGloss: true })))).toBe('at high speed');
      expect(renderClause(clause(np(WAY, { definiteness: 'indefinite' }, { adjectives: [adj(GOOD)], mannerGloss: true })))).toBe('in a good way');
    });

    test('a gloss flag on a coordination is a plain noun phrase', () => {
      const flagged = el(np(SIZE, { definiteness: 'bare' }, { dimensionGloss: true }), np(SPEED, { definiteness: 'bare' }, { dimensionGloss: true }));
      expect(renderClause(clause(flagged))).toBe('size and speed');
    });
  });

  describe('declarative', () => {
    test('subject, verb, object', () => {
      expect(renderClause(clause(np(CAT), vp(EAT), { directObject: mouse }))).toBe('the cat eats the mouse');
      expect(renderClause(clause(np(ONE), vp(EAT), { directObject: mouse }))).toBe('one eats the mouse');
    });

    test('the verb agrees with the whole subject slot', () => {
      expect(renderClause(clause(np(I), vp(EAT)))).toBe('I eat');
      expect(renderClause(clause(np(HE, { number: 'plural' }), vp(EAT)))).toBe('they eat');
      expect(renderClause(clause(el(np(CAT), np(DOG)), vp(RUN)))).toBe('the cat and the dog run');
      // A disjunction agrees with the conjunct nearest the verb.
      expect(renderClause(clause(group('or', np(CAT), np(DOG, { number: 'plural' })), vp(RUN)))).toBe('the cat or the dogs run');
      expect(renderClause(clause(group('or', np(DOG, { number: 'plural' }), np(CAT)), vp(RUN)))).toBe('the dogs or the cat runs');
    });

    // A210: a question puts the verb ahead of the subject, where an "or" group agrees with its first
    // conjunct — the element's `invertedAgreement`, which the translator resolves beside `agreement`.
    test('a question reads the inverted agreement, a statement the group agreement', () => {
      const dogsOrCat = { ...group('or', np(DOG, { number: 'plural' }), np(CAT)), invertedAgreement: { number: 'plural' } };
      expect(renderClause(clause(dogsOrCat, vp(RUN, { interrogative: true })))).toBe('do the dogs or the cat run');
      expect(renderClause(clause(dogsOrCat, vp(RUN)))).toBe('the dogs or the cat runs');
    });

    test('tense, aspect, negation and modals follow the subject', () => {
      expect(renderClause(clause(np(CAT), vp(EAT, { tense: 'past', negative: true }), { directObject: mouse }))).toBe('the cat did not eat the mouse');
      expect(renderClause(clause(np(CAT), vp(EAT, { aspect: 'resultative' })))).toBe('the cat has eaten');
      expect(renderClause(clause(np(CAT), vp(EAT, { negative: true, modals: [modal(CAN)] })))).toBe('the cat cannot eat');
      expect(renderClause(clause(np(CAT), vp(EAT, { modals: [modal(MUST, ALWAYS)] })))).toBe('the cat must always eat');
    });

    test('complements follow the object', () => {
      expect(renderClause(clause(np(CAT), vp(GIVE), { directObject: el(np(BOOK)), complements: complements({ terminus: complement(np(DOG)) }) })))
        .toBe('the cat gives the book to the dog');
      expect(renderClause(clause(np(CAT), vp(SEEM), { complements: complements({ predicative: complement(np(HAPPY, { degree: 'more' })) }) })))
        .toBe('the cat seems happier');
    });

    test('a relative clause on the subject sits before the verb', () => {
      const cat = np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT), directObject: mouse } });
      expect(renderClause(clause(cat, vp(RUN)))).toBe('the cat that eats the mouse runs');
    });
  });

  describe('imperative', () => {
    test('drops the subject from the surface', () => {
      expect(renderClause(clause(np(YOU), vp(EAT, { mood: 'imperative' }), { directObject: mouse }))).toBe('eat the mouse');
      expect(renderClause(clause(np(YOU), vp(EAT, { mood: 'imperative', negative: true })))).toBe('do not eat');
    });

    test('keeps the subject’s person to choose the form', () => {
      expect(renderClause(clause(np(WE), vp(EAT, { mood: 'imperative' }), { directObject: mouse }))).toBe("let's eat the mouse");
      expect(renderClause(clause(np(WE), vp(EAT, { mood: 'imperative', register: 'instruction' }), { directObject: mouse }))).toBe('eat the mouse');
    });
  });

  describe('infinitive', () => {
    test('drops the subject and cites the verb with to', () => {
      expect(renderClause(clause(np(CAT), vp(EAT, { mood: 'infinitive' }), { directObject: mouse }))).toBe('to eat the mouse');
      expect(renderClause(clause(np(CAT), vp(EAT, { mood: 'infinitive', negative: true })))).toBe('not to eat');
    });
  });

  describe('conditional and subjunctive', () => {
    test('the main clause takes would, the if-clause the past', () => {
      expect(renderClause(clause(np(DOG), vp(RUN, { mood: 'conditional' })))).toBe('the dog would run');
      expect(renderClause(clause(np(CAT), vp(EAT, { mood: 'subjunctive' }), { directObject: mouse }))).toBe('the cat ate the mouse');
    });

    test('ignores an attached condition', () => {
      const phrase = clause(np(DOG), vp(RUN, { mood: 'conditional' }), { condition: clause(np(CAT), vp(EAT, { mood: 'subjunctive' })) });
      expect(renderClause(phrase)).toBe('the dog would run');
    });
  });

  describe('infinitive complement', () => {
    const ABLE = { role: 'adjective', base: 'able' };
    const toEat = (subject = np(CAT)) => clause(subject, vp(EAT, { mood: 'infinitive' }), { directObject: el(np(FOOD)) });

    test('follows the clause as its own "to"-infinitive', () => {
      const able = clause(np(CAT), vp(BE), { complements: complements({ predicative: complement(np(ABLE)) }), infinitiveComplement: toEat() });
      expect(renderClause(able)).toBe('the cat is able to eat the food');
    });

    test('follows a citation, and nests', () => {
      const able = clause(np(ONE), vp(BE, { mood: 'infinitive' }), {
        complements: complements({ predicative: complement(np(ABLE)) }),
        infinitiveComplement: toEat(np(ONE)),
      });
      expect(renderClause(able)).toBe('to be able to eat the food');
    });
  });
});
