import { describe, expect, test } from 'vitest';
import { presentFinite } from './presentFinite.js';
import { JESC, POWINIEN } from './pl.fixtures.js';

describe('presentFinite', () => {
  test('reads the stored person', () => {
    expect(presentFinite(JESC, { person: '1', plural: true, gender: 'masc', virile: true })).toBe('jemy');
    expect(presentFinite(JESC, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('je');
  });

  test('powinien agrees in gender', () => {
    expect(presentFinite(POWINIEN, { person: '1', plural: false, gender: 'masc', virile: false })).toBe('powinienem');
    expect(presentFinite(POWINIEN, { person: '1', plural: false, gender: 'fem', virile: false })).toBe('powinnam');
    expect(presentFinite(POWINIEN, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('powinna');
    expect(presentFinite(POWINIEN, { person: '3', plural: true, gender: 'masc', virile: false })).toBe('powinny');
    expect(presentFinite(POWINIEN, { person: '3', plural: true, gender: 'masc', virile: true })).toBe('powinni');
  });
});
