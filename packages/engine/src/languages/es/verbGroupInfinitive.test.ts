import { describe, expect, test } from 'vitest';
import { COMER, GATO, IR, VOLVERSE, YO } from './es.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare infinitive', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'neutral')).toBe('comer');
    expect(verbGroupInfinitive(VOLVERSE, GATO, 'neutral')).toBe('volverse');
  });

  test('the progressive is estar + gerundio', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'progressive')).toBe('estar comiendo');
    expect(verbGroupInfinitive(IR, GATO, 'progressive')).toBe('estar yendo');
    expect(verbGroupInfinitive(VOLVERSE, GATO, 'progressive')).toBe('estar volviéndose');
  });

  test('the prospective is estar a punto de + infinitive', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'prospective')).toBe('estar a punto de comer');
  });

  test('the resultative is haber + participle', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'resultative')).toBe('haber comido');
    expect(verbGroupInfinitive(IR, GATO, 'resultative')).toBe('haber ido');
  });

  // A102: a reflexive verb's clitic agrees with the subject, and "haber" carries it in the perfect.
  test('a reflexive verb agrees its clitic, on the infinitive, the gerund or haber', () => {
    expect(verbGroupInfinitive(VOLVERSE, YO, 'neutral')).toBe('volverme');
    expect(verbGroupInfinitive(VOLVERSE, YO, 'progressive')).toBe('estar volviéndome');
    expect(verbGroupInfinitive(VOLVERSE, YO, 'prospective')).toBe('estar a punto de volverme');
    expect(verbGroupInfinitive(VOLVERSE, GATO, 'resultative')).toBe('haberse vuelto');
    expect(verbGroupInfinitive(VOLVERSE, YO, 'resultative')).toBe('haberme vuelto');
  });
});
