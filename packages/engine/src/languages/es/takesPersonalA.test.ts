import { describe, expect, test } from 'vitest';
import { HOMBRE, np, PERRO } from './es.fixtures.js';
import { takesPersonalA } from './takesPersonalA.js';

describe('takesPersonalA', () => {
  test('a human with a determiner takes it', () => {
    expect(takesPersonalA(np(HOMBRE))).toBe(true);
    expect(takesPersonalA(np(HOMBRE, { definiteness: 'indefinite' }))).toBe(true);
  });

  test('a bare human and a non-human do not', () => {
    expect(takesPersonalA(np(HOMBRE, { definiteness: 'bare' }))).toBe(false);
    expect(takesPersonalA(np(PERRO))).toBe(false);
  });
});
