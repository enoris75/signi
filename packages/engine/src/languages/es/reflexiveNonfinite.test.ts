import { describe, expect, test } from 'vitest';
import { COMER, GATO, NOSOTROS, TU, VOLVERSE, YO } from './es.fixtures.js';
import { reflexiveNonfinite } from './reflexiveNonfinite.js';

describe('reflexiveNonfinite', () => {
  test('the infinitive and the gerund take the subject\'s clitic, attached', () => {
    expect(reflexiveNonfinite('volverse', VOLVERSE, YO)).toBe('volverme');
    expect(reflexiveNonfinite('volviéndose', VOLVERSE, TU)).toBe('volviéndote');
    expect(reflexiveNonfinite('volviéndose', VOLVERSE, NOSOTROS)).toBe('volviéndonos');
    expect(reflexiveNonfinite('volverse', VOLVERSE, GATO)).toBe('volverse');
  });

  test('an auxiliary infinitive takes the clitic too', () => {
    expect(reflexiveNonfinite('haber', VOLVERSE, GATO)).toBe('haberse');
    expect(reflexiveNonfinite('estar', VOLVERSE, YO)).toBe('estarme');
  });

  test('a non-reflexive verb keeps its form', () => {
    expect(reflexiveNonfinite('comer', COMER, YO)).toBe('comer');
  });
});
