import { describe, expect, test } from 'vitest';
import { clause, complement, complements, el, np, vp } from '../languages/resolved.fixtures.js';
import { infinitiveController } from './infinitiveController.js';

const CAT = { base: 'gatta', gender: 'fem', number: 'singular', person: '3' };
const FOOD = { base: 'cibo', gender: 'masc', number: 'singular', person: '3' };
const SUBJECT = { gender: 'fem', number: 'singular', person: '3' };

const eats = (control?: 'object') => clause(np(FOOD), vp({ base: 'essere' }, { mood: 'infinitive' }), {
  complements: complements({ predicative: complement(np({ base: 'attento', role: 'adjective' })) }),
  ...(control ? { control } : {}),
});

describe('infinitiveController', () => {
  test('subject control keeps the agreement the engine computed for the clause', () => {
    const phrase = clause(np(CAT), vp({ base: 'desiderare' }), { directObject: el(np(FOOD)), infinitiveComplement: eats() });
    expect(infinitiveController(phrase, SUBJECT)).toBe(SUBJECT);
  });

  test('object control takes the direct object’s agreement', () => {
    const phrase = clause(np(CAT), vp({ base: 'indurre' }), { directObject: el(np(FOOD)), infinitiveComplement: eats('object') });
    expect(infinitiveController(phrase, SUBJECT)).toEqual(FOOD);
  });

  test('a coordinated object hands over the group agreement, not one conjunct', () => {
    const both = el(np(FOOD), np(CAT));
    const phrase = clause(np(CAT), vp({ base: 'indurre' }), { directObject: both, infinitiveComplement: eats('object') });
    expect(infinitiveController(phrase, SUBJECT)).toEqual(both.agreement);
    expect(infinitiveController(phrase, SUBJECT)['number']).toBe('plural');
  });

  test('object control with no object falls back to the subject', () => {
    const phrase = clause(np(CAT), vp({ base: 'indurre' }), { infinitiveComplement: eats('object') });
    expect(infinitiveController(phrase, SUBJECT)).toBe(SUBJECT);
  });

  test('a clause with no infinitive complement is its own subject’s', () => {
    expect(infinitiveController(clause(np(CAT), vp({ base: 'correre' })), SUBJECT)).toBe(SUBJECT);
  });
});
