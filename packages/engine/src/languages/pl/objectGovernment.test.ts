import { describe, expect, test } from 'vitest';
import { objectGovernment } from './objectGovernment.js';
import { CZEKAC, JESC, POMAGAC } from './pl.fixtures.js';

describe('objectGovernment', () => {
  test('the accusative, and the genitive of negation', () => {
    expect(objectGovernment(JESC, false)).toEqual({ prep: '', case: 'acc' });
    expect(objectGovernment(JESC, true)).toEqual({ prep: '', case: 'gen' });
  });

  test('a lexical case stays under negation', () => {
    expect(objectGovernment(POMAGAC, true)).toEqual({ prep: '', case: 'dat' });
  });

  test('a prepositional object', () => {
    expect(objectGovernment(CZEKAC, true)).toEqual({ prep: 'na', case: 'acc' });
  });
});
