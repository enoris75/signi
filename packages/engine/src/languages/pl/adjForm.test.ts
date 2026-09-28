import { describe, expect, test } from 'vitest';
import { adjForm } from './adjForm.js';
import { cf } from './pl.fixtures.js';
import type { Agr } from './pl.types.js';

const M: Agr = { gender: 'masc', plural: false, virile: false, animate: false };
const F: Agr = { ...M, gender: 'fem' };
const VIR: Agr = { gender: 'masc', plural: true, virile: true, animate: true };

describe('adjForm', () => {
  test('the positive declines by rule', () => {
    expect(adjForm(cf('BIG'), 'gen', F)).toBe('dużej');
  });

  test('the synthetic comparative and superlative decline too', () => {
    expect(adjForm(cf('BIG', { degree: 'more' }), 'nom', M)).toBe('większy');
    expect(adjForm(cf('BIG', { degree: 'more' }), 'nom', VIR)).toBe('więksi');
    expect(adjForm(cf('BIG', { degree: 'most' }), 'ins', F)).toBe('największą');
    expect(adjForm(cf('GOOD', { degree: 'most' }), 'nom', M)).toBe('najlepszy');
  });

  test('without one, bardziej / najbardziej', () => {
    expect(adjForm(cf('LAST_FINAL', { degree: 'more' }), 'nom', F)).toBe('bardziej ostatnia');
    expect(adjForm(cf('LAST_FINAL', { degree: 'most' }), 'nom', M)).toBe('najbardziej ostatni');
  });

  test('less, least and the equative', () => {
    expect(adjForm(cf('BIG', { degree: 'less' }), 'nom', M)).toBe('mniej duży');
    expect(adjForm(cf('BIG', { degree: 'equally' }), 'nom', M)).toBe('równie duży');
    expect(adjForm(cf('BIG', { degree: 'equally', standard: '1' }), 'nom', M)).toBe('tak duży');
  });

  test('an intensifier leads', () => {
    expect(adjForm(cf('BIG', { intensifier: 'bardzo' }), 'nom', F)).toBe('bardzo duża');
  });

  test('a stored table', () => {
    expect(adjForm(cf('SAME'), 'loc', F)).toBe('tej samej');
  });
});
