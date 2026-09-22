import { describe, expect, test } from 'vitest';
import { clause, complement, complements, concept, el, modal, np, vp } from '../languages/resolved.fixtures.js';
import { foldModalGovernor } from './foldModalGovernor.js';

const CAT = { base: 'cat', person: '3', number: 'singular' };
const DOG = { base: 'dog', person: '3', number: 'singular' };
const MOUSE = { base: 'mouse', person: '3', number: 'singular' };
const HOUSE = { base: 'house', person: '3', number: 'singular' };
const WANT = { base: 'want', link: 'to', modal: '1' };
const CAN = { base: 'can', nonfinite: 'be able to', modal: '1' };
const MUST = { base: 'must', nonfinite: 'have to', modal: '1' };
const DESIRE = { base: 'desire' };
const EAT = { base: 'eat' };
const ALWAYS = { base: 'always', subtype: 'frequency' };
const FAST = { base: 'fast' };

/** The complement "eat the mouse", in the citation mood an infinitive complement is resolved in. */
const eatTheMouse = (extra: Parameters<typeof vp>[1] = {}) =>
  clause(np(CAT), vp(EAT, { mood: 'infinitive', ...extra }), { directObject: el(np(MOUSE)) });

describe('foldModalGovernor', () => {
  test('a modal governing an infinitive becomes the chain over the complement’s verb', () => {
    const folded = foldModalGovernor(clause(np(CAT), vp(WANT, { tense: 'past' }), { infinitiveComplement: eatTheMouse() }));
    expect(folded.verbPhrase?.verb.forms).toEqual(EAT);
    expect(folded.verbPhrase?.modals).toEqual([modal(WANT)]);
    expect(folded.verbPhrase?.tense).toBe('past');
    expect(folded.subject.conjuncts[0].head.forms).toEqual(CAT);
    expect(folded.directObject?.conjuncts[0].head.forms).toEqual(MOUSE);
    expect(folded.infinitiveComplement).toBeUndefined();
  });

  test('the governing clause keeps its mood, negation, question and register; the complement its verb’s own', () => {
    const folded = foldModalGovernor(clause(np(CAT), vp(CAN, { mood: 'infinitive', negative: true, interrogative: true }), {
      infinitiveComplement: eatTheMouse({ modifier: concept(FAST), voice: 'active' }),
    }));
    expect(folded.verbPhrase).toMatchObject({ mood: 'infinitive', negative: true, interrogative: true, voice: 'active' });
    expect(folded.verbPhrase?.modifier?.forms).toEqual(FAST);
  });

  test('the modal carries its own adverb into the chain, after any modal it already had', () => {
    const folded = foldModalGovernor(clause(np(CAT), vp(WANT, { modifier: concept(ALWAYS), modals: [modal(MUST)] }), {
      infinitiveComplement: eatTheMouse(),
    }));
    expect(folded.verbPhrase?.modals).toEqual([modal(MUST), modal(WANT, ALWAYS)]);
    expect(folded.verbPhrase?.modifier).toBeUndefined();
  });

  test('a modal governing a modal folds again, outermost first', () => {
    const canEat = clause(np(CAT), vp(CAN, { mood: 'infinitive' }), { infinitiveComplement: eatTheMouse() });
    const folded = foldModalGovernor(clause(np(CAT), vp(WANT, { mood: 'infinitive' }), { infinitiveComplement: canEat }));
    expect(folded.verbPhrase?.verb.forms).toEqual(EAT);
    expect(folded.verbPhrase?.modals).toEqual([modal(WANT), modal(CAN)]);
  });

  test('the complement’s own complement stays nested, and the two clauses’ complements merge', () => {
    const desireToEat = clause(np(CAT), vp(DESIRE, { mood: 'infinitive' }), {
      infinitiveComplement: eatTheMouse(), complements: complements({ locative: complement(np(HOUSE)) }),
    });
    const folded = foldModalGovernor(clause(np(CAT), vp(WANT), { infinitiveComplement: desireToEat }));
    expect(folded.verbPhrase?.verb.forms).toEqual(DESIRE);
    expect(folded.infinitiveComplement?.verbPhrase?.verb.forms).toEqual(EAT);
    expect(Object.keys(folded.complements ?? {})).toEqual(['locative']);
  });

  test('the governing clause’s condition, coordination, purpose and control come along', () => {
    const other = clause(np(DOG), vp(EAT));
    const folded = foldModalGovernor(clause(np(CAT), vp(WANT), {
      infinitiveComplement: eatTheMouse(), condition: other, coordination: { conjunction: 'and', clause: other }, purpose: eatTheMouse(),
      control: 'object',
    }));
    expect(folded).toMatchObject({ condition: other, coordination: { conjunction: 'and', clause: other }, control: 'object' });
    expect(folded.purpose).toBeDefined();
  });

  test('every other clause comes back as it is', () => {
    const lexical = clause(np(CAT), vp(DESIRE), { infinitiveComplement: eatTheMouse() });
    const noComplement = clause(np(CAT), vp(WANT), { directObject: el(np(MOUSE)) });
    const negatedComplement = clause(np(CAT), vp(WANT), { infinitiveComplement: eatTheMouse({ negative: true }) });
    const objectControlled = clause(np(CAT), vp(WANT), { directObject: el(np(DOG)), infinitiveComplement: { ...eatTheMouse(), control: 'object' } });
    const ownObject = clause(np(CAT), vp(WANT), { directObject: el(np(DOG)), infinitiveComplement: eatTheMouse() });
    const verbless = clause(np(CAT));
    for (const phrase of [lexical, noComplement, negatedComplement, objectControlled, ownObject, verbless]) {
      expect(foldModalGovernor(phrase)).toBe(phrase);
    }
  });
});
