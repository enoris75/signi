import { describe, expect, test } from 'vitest';
import { aspectVerb } from './aspectVerb.js';
import { COMER, GATO, IR, NOSOTROS, VOLVERSE, YO } from './es.fixtures.js';

const GATOS = { ...GATO, number: 'plural' };

describe('aspectVerb', () => {
  test('the progressive is estar + gerundio, agreeing with the subject', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'progressive')).toBe('está comiendo');
    expect(aspectVerb(IR, YO, 'present', 'progressive')).toBe('estoy yendo');
    expect(aspectVerb(COMER, NOSOTROS, 'future', 'progressive')).toBe('estaremos comiendo');
  });

  test('the past progressive takes the imperfect estaba', () => {
    expect(aspectVerb(COMER, GATO, 'past', 'progressive')).toBe('estaba comiendo');
    expect(aspectVerb(COMER, GATOS, 'past', 'progressive')).toBe('estaban comiendo');
  });

  test('the prospective is estar a punto de + infinitive', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'prospective')).toBe('está a punto de comer');
    expect(aspectVerb(IR, NOSOTROS, 'past', 'prospective')).toBe('estábamos a punto de ir');
  });

  test('the resultative is haber + an unagreeing participle', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'resultative')).toBe('ha comido');
    expect(aspectVerb(COMER, YO, 'present', 'resultative')).toBe('he comido');
    expect(aspectVerb(IR, { ...GATOS, gender: 'fem' }, 'past', 'resultative')).toBe('habían ido');
    expect(aspectVerb(IR, GATO, 'future', 'resultative')).toBe('habrá ido');
  });

  // The participle drops the -se of "volverse"; without the clitic "ha vuelto" means "has returned".
  test('a reflexive verb restores its clitic ahead of the perfect auxiliary', () => {
    expect(aspectVerb(VOLVERSE, GATO, 'present', 'resultative')).toBe('se ha vuelto');
    expect(aspectVerb(VOLVERSE, YO, 'present', 'resultative')).toBe('me he vuelto');
    expect(aspectVerb(VOLVERSE, NOSOTROS, 'past', 'resultative')).toBe('nos habíamos vuelto');
  });

  test('the progressive leaves the reflexive clitic on the gerund', () => {
    expect(aspectVerb(VOLVERSE, GATO, 'present', 'progressive')).toBe('está volviéndose');
  });

  test('under a hypothetical the auxiliary takes the conditional or the imperfect subjunctive', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'progressive', 'conditional')).toBe('estaría comiendo');
    expect(aspectVerb(COMER, NOSOTROS, 'present', 'prospective', 'conditional')).toBe('estaríamos a punto de comer');
    expect(aspectVerb(COMER, GATO, 'present', 'resultative', 'conditional')).toBe('habría comido');
    expect(aspectVerb(COMER, GATO, 'present', 'progressive', 'subjunctive')).toBe('estuviera comiendo');
    expect(aspectVerb(COMER, GATO, 'present', 'resultative', 'subjunctive')).toBe('hubiera comido');
  });

  test('any other mood keeps the tense table', () => {
    expect(aspectVerb(COMER, GATO, 'past', 'resultative', 'indicative')).toBe('había comido');
  });
});
