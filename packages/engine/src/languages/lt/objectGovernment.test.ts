import { describe, expect, test } from 'vitest';
import { objectGovernment } from './objectGovernment.js';
import { GALVOTI, LAUKTI, PADETI, VALGYTI } from './lt.fixtures.js';

describe('objectGovernment', () => {
  test('the accusative, and the obligatory genitive of negation', () => {
    expect(objectGovernment(VALGYTI, false)).toEqual({ prep: '', case: 'acc' });
    expect(objectGovernment(VALGYTI, true)).toEqual({ prep: '', case: 'gen' });
  });

  test('a lexical case stays under negation', () => {
    expect(objectGovernment(PADETI, true)).toEqual({ prep: '', case: 'dat' });
    expect(objectGovernment(LAUKTI, false)).toEqual({ prep: '', case: 'gen' });
  });

  test('a prepositional object', () => {
    expect(objectGovernment(GALVOTI, true)).toEqual({ prep: 'apie', case: 'acc' });
  });
});
