import { describe, expect, test } from 'vitest';
import { adjForm } from './adjForm.js';
import { cf } from './lt.fixtures.js';
import type { Agr } from './lt.types.js';

const M: Agr = { gender: 'masc', plural: false };
const F: Agr = { gender: 'fem', plural: false };
const MP: Agr = { gender: 'masc', plural: true };

describe('adjForm', () => {
  test('the positive declines by class', () => {
    expect(adjForm(cf('BIG'), 'gen', F)).toBe('didelės');
    expect(adjForm(cf('BEAUTIFUL'), 'acc', M)).toBe('gražų');
    expect(adjForm(cf('GOOD'), 'loc', MP)).toBe('geruose');
  });

  test('the synthetic comparative and superlative decline too', () => {
    expect(adjForm(cf('BIG', { degree: 'more' }), 'nom', M)).toBe('didesnis');
    expect(adjForm(cf('BIG', { degree: 'more' }), 'nom', MP)).toBe('didesni');
    expect(adjForm(cf('BIG', { degree: 'most' }), 'ins', F)).toBe('didžiausia');
    expect(adjForm(cf('GOOD', { degree: 'more' }), 'gen', F)).toBe('geresnės');
    expect(adjForm(cf('WHITE', { degree: 'most' }), 'nom', M)).toBe('balčiausias');
  });

  test('without one, labiau / labiausiai', () => {
    expect(adjForm(cf('SEMANTIC', { degree: 'more' }), 'nom', F)).toBe('labiau semantinė');
    expect(adjForm(cf('SEMANTIC', { degree: 'most' }), 'nom', M)).toBe('labiausiai semantinis');
  });

  test('less, least and the equative', () => {
    expect(adjForm(cf('BIG', { degree: 'less' }), 'nom', M)).toBe('mažiau didelis');
    expect(adjForm(cf('BIG', { degree: 'least' }), 'nom', F)).toBe('mažiausiai didelė');
    expect(adjForm(cf('BIG', { degree: 'equally', standard: '1' }), 'nom', M)).toBe('taip pat didelis');
  });

  test('the neuter for a genderless subject', () => {
    expect(adjForm(cf('GOOD'), 'nom', { gender: 'neut', plural: false })).toBe('gera');
    expect(adjForm(cf('BEAUTIFUL'), 'nom', { gender: 'neut', plural: false })).toBe('gražu');
  });

  test('an intensifier leads', () => {
    expect(adjForm(cf('BIG', { intensifier: 'labai' }), 'nom', F)).toBe('labai didelė');
  });

  test('a stored table and an invariable adjective', () => {
    const same = cf('SAME', { role: 'adjective', base: 'tas pats', fem: 'ta pati', fem_loc: 'toje pačioje', gen: 'to paties' });
    expect(adjForm(same, 'loc', F)).toBe('toje pačioje');
    expect(adjForm(cf('OKAY', { role: 'adjective', base: 'gerai', invariable: '1' }), 'gen', F)).toBe('gerai');
  });
});
