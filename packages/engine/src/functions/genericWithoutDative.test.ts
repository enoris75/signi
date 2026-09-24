import { describe, expect, test } from 'vitest';
import { el, np } from '../languages/resolved.fixtures.js';
import { genericWithoutDative } from './genericWithoutDative.js';

const SI = { person: '3', number: 'singular', base: 'si', generic: '1' };
const MAN = { person: '3', number: 'singular', base: 'man', generic: '1', disjunctive: 'einem' };
const ER = { person: '3', number: 'singular', base: 'er', disjunctive: 'ihm' };

describe('genericWithoutDative', () => {
  test('a generic with no dative form', () => {
    expect(genericWithoutDative({ ...el(np(SI)), agreement: { generic: '1' } })).toBe(true);
  });

  test('a generic whose language gives it a dative (de "einem")', () => {
    expect(genericWithoutDative({ ...el(np(MAN)), agreement: { generic: '1' } })).toBe(false);
  });

  test('any other element', () => {
    expect(genericWithoutDative(el(np(ER)))).toBe(false);
  });
});
