import { describe, expect, test } from 'vitest';
import { modifierText } from './modifierText.js';
import { adj, BELO, CASA, type Forms, GATO, LIVRO, nounModifier, np, PALAVRA, VELHO } from './pt.fixtures.js';

const BARCO: Forms = { base: 'barco', plural: 'barcos', gender: 'masc', count: 'singular' };
const VELA: Forms = { base: 'vela', plural: 'velas', gender: 'fem', count: 'singular' };
const MADEIRA: Forms = { base: 'madeira', plural: 'madeiras', gender: 'fem', count: 'singular' };
const CRIADOR: Forms = { base: 'criador', plural: 'criadores', gender: 'masc', count: 'singular', animate: '1', human: '1' };
const FRASE: Forms = { base: 'frase', plural: 'frases', gender: 'fem', count: 'singular' };
const SEMANTICO: Forms = { role: 'adjective', base: 'semântico' };

describe('modifierText', () => {
  test('is empty without attributive nouns', () => {
    expect(modifierText(np(GATO))).toBe('');
  });

  test('the relation picks the bare linking preposition', () => {
    expect(modifierText(np(BARCO, {}, { nounModifiers: [nounModifier(VELA, [], 'feature')] }))).toBe(' a vela');
    expect(modifierText(np(LIVRO, {}, { nounModifiers: [nounModifier({ ...PALAVRA, number: 'plural' }, [], 'purpose')] }))).toBe(' de palavras');
    expect(modifierText(np(CASA, {}, { nounModifiers: [nounModifier(MADEIRA, [], 'material')] }))).toBe(' de madeira');
  });

  test('the modifier takes its own number, and its adjectives agree with it, not the head', () => {
    const phrases = nounModifier({ ...FRASE, number: 'plural' }, [adj(SEMANTICO)], 'material');
    expect(modifierText(np(CRIADOR, {}, { nounModifiers: [phrases] }))).toBe(' de frases semânticas');
    expect(modifierText(np(BARCO, {}, { nounModifiers: [nounModifier(MADEIRA, [adj(VELHO), adj(BELO)], 'material')] })))
      .toBe(' de madeira velha e bela');
  });

  test('several modifiers each bring their own preposition', () => {
    const phrase = np(BARCO, {}, { nounModifiers: [nounModifier(VELA, [], 'feature'), nounModifier(MADEIRA, [], 'material')] });
    expect(modifierText(phrase)).toBe(' a vela de madeira');
  });

  test('a modifier with no surface form is dropped', () => {
    expect(modifierText(np(BARCO, {}, { nounModifiers: [nounModifier({ gender: 'fem' }, [], 'feature')] }))).toBe('');
  });
});
