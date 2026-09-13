import { describe, expect, test } from 'vitest';
import { nounPhrase } from './nounPhrase.js';
import { AFRICA, AGUA, CAO, CASA, DINHEIRO, GATO, RATO } from './pt.fixtures.js';

describe('nounPhrase', () => {
  test('defaults to the definite article, agreeing in gender and number', () => {
    expect(nounPhrase(GATO)).toBe('o gato');
    expect(nounPhrase(CASA)).toBe('a casa');
    expect(nounPhrase({ ...CAO, number: 'plural' })).toBe('os cães');
    expect(nounPhrase({ ...CASA, count: 'plural' })).toBe('as casas');
  });

  test('the indefinite article and the bare noun', () => {
    expect(nounPhrase({ ...GATO, definiteness: 'indefinite' })).toBe('um gato');
    expect(nounPhrase({ ...CASA, definiteness: 'indefinite', number: 'plural' })).toBe('umas casas');
    expect(nounPhrase({ ...GATO, definiteness: 'bare', number: 'plural' })).toBe('gatos');
  });

  test('the demonstratives: proximal este, medial esse', () => {
    expect(nounPhrase({ ...GATO, definiteness: 'this' })).toBe('este gato');
    expect(nounPhrase({ ...CASA, definiteness: 'that' })).toBe('essa casa');
    expect(nounPhrase({ ...GATO, definiteness: 'this', number: 'plural' })).toBe('estes gatos');
  });

  test('the plural quantifiers agree in gender, and todos takes the article', () => {
    expect(nounPhrase({ ...GATO, definiteness: 'some', number: 'plural' })).toBe('alguns gatos');
    expect(nounPhrase({ ...CASA, definiteness: 'many', number: 'plural' })).toBe('muitas casas');
    expect(nounPhrase({ ...GATO, definiteness: 'few', number: 'plural' })).toBe('poucos gatos');
    expect(nounPhrase({ ...CASA, definiteness: 'all', number: 'plural' })).toBe('todas as casas');
  });

  test('nenhum stays singular even when the plural is asked for', () => {
    expect(nounPhrase({ ...RATO, definiteness: 'no', number: 'plural' })).toBe('nenhum rato');
    expect(nounPhrase({ ...CASA, definiteness: 'no' })).toBe('nenhuma casa');
  });

  test('a mass noun takes the mass quantifiers and no indefinite article', () => {
    expect(nounPhrase(AGUA)).toBe('a água');
    expect(nounPhrase({ ...AGUA, definiteness: 'indefinite' })).toBe('água');
    expect(nounPhrase({ ...AGUA, definiteness: 'some' })).toBe('um pouco de água');
    expect(nounPhrase({ ...AGUA, definiteness: 'many' })).toBe('muita água');
    expect(nounPhrase({ ...DINHEIRO, definiteness: 'few' })).toBe('pouco dinheiro');
    expect(nounPhrase({ ...AGUA, definiteness: 'all' })).toBe('toda a água');
    expect(nounPhrase({ ...DINHEIRO, definiteness: 'no' })).toBe('nenhum dinheiro');
    expect(nounPhrase({ ...AGUA, definiteness: 'this' })).toBe('esta água');
  });

  test('a proper name keeps the definite article whatever was picked', () => {
    expect(nounPhrase(AFRICA)).toBe('a África');
    expect(nounPhrase({ ...AFRICA, definiteness: 'indefinite' })).toBe('a África');
    expect(nounPhrase({ ...AFRICA, definiteness: 'that' })).toBe('a África');
  });

  test('sets the adjectives around the noun', () => {
    expect(nounPhrase(GATO, { pre: '', post: 'grande' })).toBe('o gato grande');
    expect(nounPhrase(CASA, { pre: 'primeira', post: 'velha e bela' })).toBe('a primeira casa velha e bela');
  });

  test('a pronominal possessive replaces the picked determiner', () => {
    expect(nounPhrase({ ...CAO, definiteness: 'indefinite' }, undefined, 'o seu')).toBe('o seu cão');
    expect(nounPhrase({ ...CASA, number: 'plural' }, { pre: '', post: 'velhas' }, 'as minhas')).toBe('as minhas casas velhas');
  });
});
