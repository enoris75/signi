import { describe, expect, test } from 'vitest';
import { ESTAR_AUX, ESTAR_ES, HABER_AUX, HABER_ES } from './es.consts.js';
import { ELLOS, GATO, NOSOTROS, TU, YO } from './es.fixtures.js';
import { auxFinite } from './auxFinite.js';

describe('auxFinite', () => {
  test('without a mood, the tense table’s form for the subject', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_ES, GATO, 'present')).toBe('está');
    expect(auxFinite(ESTAR_AUX, ESTAR_ES, NOSOTROS, 'future')).toBe('estaremos');
    expect(auxFinite(HABER_AUX, HABER_ES, YO, 'present')).toBe('he');
    expect(auxFinite(HABER_AUX, HABER_ES, TU, 'future', 'indicative')).toBe('habrás');
  });

  test('the past auxiliary is the imperfect', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_ES, GATO, 'past')).toBe('estaba');
    expect(auxFinite(HABER_AUX, HABER_ES, ELLOS, 'past')).toBe('habían');
  });

  test('the conditional is built on the future stem, whatever the tense', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_ES, GATO, 'present', 'conditional')).toBe('estaría');
    expect(auxFinite(HABER_AUX, HABER_ES, NOSOTROS, 'past', 'conditional')).toBe('habríamos');
  });

  test('the imperfect subjunctive is built on the irregular preterite stem', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_ES, GATO, 'present', 'subjunctive')).toBe('estuviera');
    expect(auxFinite(HABER_AUX, HABER_ES, TU, 'present', 'subjunctive')).toBe('hubieras');
    expect(auxFinite(HABER_AUX, HABER_ES, ELLOS, 'past', 'subjunctive')).toBe('hubieran');
  });
});
