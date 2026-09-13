import { describe, expect, test } from 'vitest';
import { COMER, el, ELLOS, GATO, IR, np, NOSOTROS, SER, TU, VOLVERSE, VOSOTROS, YO } from './es.fixtures.js';
import { conjugate } from './conjugate.js';

describe('conjugate', () => {
  test('picks the form for the subject’s person and number', () => {
    expect(conjugate(COMER, YO)).toBe('como');
    expect(conjugate(COMER, TU)).toBe('comes');
    expect(conjugate(COMER, NOSOTROS)).toBe('comemos');
    expect(conjugate(COMER, VOSOTROS)).toBe('coméis');
    expect(conjugate(COMER, ELLOS)).toBe('comen');
  });

  test('a noun subject is third person', () => {
    expect(conjugate(COMER, GATO)).toBe('come');
    expect(conjugate(COMER, { ...GATO, number: 'plural' })).toBe('comen');
    expect(conjugate(COMER, el(np(GATO), np(YO)).agreement)).toBe('comemos');
  });

  test('defaults to the third-person singular present', () => {
    expect(conjugate(COMER, {})).toBe('come');
  });

  test('the past is the preterite and the future synthetic', () => {
    // C06: the simple past is the perfective preterite.
    expect(conjugate(COMER, YO, 'past')).toBe('comí');
    expect(conjugate(IR, ELLOS, 'past')).toBe('fueron');
    expect(conjugate(SER, VOSOTROS, 'future')).toBe('seréis');
  });

  test('a reflexive verb’s stored forms carry their clitic', () => {
    expect(conjugate(VOLVERSE, GATO)).toBe('se vuelve');
    expect(conjugate(VOLVERSE, NOSOTROS, 'past')).toBe('nos volvimos');
  });

  test('a partial paradigm falls back to a bare tense form, the present, then the infinitive', () => {
    expect(conjugate({ base: 'comer', past: 'comió' }, GATO, 'past')).toBe('comió');
    expect(conjugate({ base: 'comer', '1sg_present': 'como' }, YO, 'future')).toBe('como');
    expect(conjugate({ base: 'comer' }, YO)).toBe('comer');
    expect(conjugate({}, YO)).toBe('');
  });
});
