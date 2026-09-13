import { describe, expect, test } from 'vitest';
import { aspectVerb } from './aspectVerb.js';
import { COMER, ELES, EU, GATO, IR, NOS, VER } from './pt.fixtures.js';

describe('aspectVerb', () => {
  test('the progressive is estar + gerúndio, estar in the imperfect for the past', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'progressive')).toBe('está comendo');
    expect(aspectVerb(COMER, EU, 'past', 'progressive')).toBe('estava comendo');
    expect(aspectVerb(IR, ELES, 'future', 'progressive')).toBe('estarão indo');
  });

  test('the prospective is estar + "prestes a" + infinitive', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'prospective')).toBe('está prestes a comer');
    expect(aspectVerb(IR, NOS, 'past', 'prospective')).toBe('estávamos prestes a ir');
  });

  // "tem comido" is iterative in Portuguese, so the present perfect of a bounded event is the
  // pretérito perfeito (A9).
  test('the present resultative is the pretérito perfeito, not ter + particípio', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'resultative')).toBe('comeu');
    expect(aspectVerb(VER, EU, 'present', 'resultative')).toBe('vi');
  });

  test('the past and future resultatives are ter + particípio', () => {
    expect(aspectVerb(COMER, GATO, 'past', 'resultative')).toBe('tinha comido');
    expect(aspectVerb(VER, NOS, 'past', 'resultative')).toBe('tínhamos visto');
    expect(aspectVerb(VER, GATO, 'future', 'resultative')).toBe('terá visto');
  });

  test('under a hypothetical the auxiliary takes the conditional or the imperfect subjunctive', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'progressive', 'conditional')).toBe('estaria comendo');
    expect(aspectVerb(IR, ELES, 'present', 'prospective', 'conditional')).toBe('estariam prestes a ir');
    expect(aspectVerb(COMER, GATO, 'present', 'progressive', 'subjunctive')).toBe('estivesse comendo');
  });

  test('a hypothetical present resultative is a genuine perfect, not the pretérito', () => {
    expect(aspectVerb(COMER, GATO, 'present', 'resultative', 'conditional')).toBe('teria comido');
    expect(aspectVerb(COMER, EU, 'present', 'resultative', 'subjunctive')).toBe('tivesse comido');
  });
});
