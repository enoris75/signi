import { describe, expect, test } from 'vitest';
import { demForm } from './demForm.js';

describe('demForm', () => {
  test('dies- takes the definite article endings for case and gender', () => {
    expect(demForm(false, 'nom', 'masc', false)).toBe('dieser');
    expect(demForm(false, 'nom', 'fem', false)).toBe('diese');
    expect(demForm(false, 'acc', 'masc', false)).toBe('diesen');
    expect(demForm(false, 'dat', 'neut', false)).toBe('diesem');
    expect(demForm(false, 'dat', 'fem', false)).toBe('dieser');
    expect(demForm(false, 'gen', 'neut', false)).toBe('dieses');
  });

  test('distal picks jen- on the same endings', () => {
    expect(demForm(true, 'nom', 'neut', false)).toBe('jenes');
    expect(demForm(true, 'acc', 'masc', false)).toBe('jenen');
    expect(demForm(true, 'dat', 'fem', false)).toBe('jener');
  });

  test('the plural ignores gender', () => {
    expect(demForm(false, 'nom', 'masc', true)).toBe('diese');
    expect(demForm(true, 'dat', 'fem', true)).toBe('jenen');
    expect(demForm(false, 'gen', 'neut', true)).toBe('dieser');
  });

  test('a missing gender falls back to neuter', () => {
    expect(demForm(false, 'nom', '', false)).toBe('dieses');
  });
});
