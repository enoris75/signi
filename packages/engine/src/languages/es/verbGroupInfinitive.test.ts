import { describe, expect, test } from 'vitest';
import { COMER, IR, VOLVERSE } from './es.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare infinitive', () => {
    expect(verbGroupInfinitive(COMER, 'neutral')).toBe('comer');
    expect(verbGroupInfinitive(VOLVERSE, 'neutral')).toBe('volverse');
  });

  test('the progressive is estar + gerundio', () => {
    expect(verbGroupInfinitive(COMER, 'progressive')).toBe('estar comiendo');
    expect(verbGroupInfinitive(IR, 'progressive')).toBe('estar yendo');
    expect(verbGroupInfinitive(VOLVERSE, 'progressive')).toBe('estar volviéndose');
  });

  test('the prospective is estar a punto de + infinitive', () => {
    expect(verbGroupInfinitive(COMER, 'prospective')).toBe('estar a punto de comer');
  });

  test('the resultative is haber + participle', () => {
    expect(verbGroupInfinitive(COMER, 'resultative')).toBe('haber comido');
    expect(verbGroupInfinitive(IR, 'resultative')).toBe('haber ido');
  });
});
