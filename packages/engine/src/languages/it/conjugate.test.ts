import { describe, expect, test } from 'vitest';
import { ANDARE, el, ESSERE, GATTO, IO, LORO, MANGIARE, NOI, np, TU, VEDERE } from './it.fixtures.js';
import { conjugate } from './conjugate.js';

describe('conjugate', () => {
  test('picks the person/number form of the present by default', () => {
    expect(conjugate(MANGIARE, IO)).toBe('mangio');
    expect(conjugate(MANGIARE, TU)).toBe('mangi');
    expect(conjugate(MANGIARE, NOI)).toBe('mangiamo');
    expect(conjugate(MANGIARE, { ...TU, number: 'plural' })).toBe('mangiate');
    expect(conjugate(ANDARE, LORO)).toBe('vanno');
  });

  test('a noun subject is third person, singular unless marked plural', () => {
    expect(conjugate(ESSERE, GATTO)).toBe('è');
    expect(conjugate(ESSERE, { ...GATTO, number: 'plural' })).toBe('sono');
  });

  test('past and future read their own paradigm', () => {
    expect(conjugate(MANGIARE, GATTO, 'past')).toBe('mangiò');
    expect(conjugate(VEDERE, NOI, 'past')).toBe('vedemmo');
    expect(conjugate(ANDARE, IO, 'future')).toBe('andrò');
    expect(conjugate(ESSERE, LORO, 'future')).toBe('saranno');
  });

  test('a coordinated subject agrees as a group: io e tu mangiamo', () => {
    expect(conjugate(MANGIARE, el(np(IO), np(TU)).agreement)).toBe('mangiamo');
    expect(conjugate(MANGIARE, el(np(GATTO), np(TU)).agreement)).toBe('mangiate');
  });
});
