import { describe, expect, test } from 'vitest';
import { adj, BARCA, type Forms, FRASE, nounModifier, np, VELA } from './it.fixtures.js';
import { itMods } from './itMods.js';

const SOLE: Forms = { base: 'sole', plural: 'soli', gender: 'masc', count: 'singular' };
const LEGNO: Forms = { base: 'legno', plural: 'legni', gender: 'masc', count: 'singular' };
const CREATORE: Forms = { base: 'creatore', plural: 'creatori', gender: 'masc', count: 'singular' };
const SEMANTICO: Forms = { role: 'adjective', base: 'semantico' };

describe('itMods', () => {
  test('renders nothing without attributive nouns', () => {
    expect(itMods(np(BARCA))).toBe('');
  });

  test('the relation picks a bare preposition: feature a, purpose da, material di', () => {
    expect(itMods(np(BARCA, {}, { nounModifiers: [nounModifier(VELA)] }))).toBe('a vela');
    expect(itMods(np(BARCA, {}, { nounModifiers: [nounModifier(SOLE, [], 'purpose')] }))).toBe('da sole');
    expect(itMods(np(BARCA, {}, { nounModifiers: [nounModifier(LEGNO, [], 'material')] }))).toBe('di legno');
  });

  test('the modifier takes its own number, and its adjectives agree with it, not the head', () => {
    const phrases = nounModifier({ ...FRASE, number: 'plural' }, [adj(SEMANTICO)], 'material');
    expect(itMods(np(CREATORE, {}, { nounModifiers: [phrases] }))).toBe('di frasi semantiche');
  });

  test('several modifiers follow one another', () => {
    const modifiers = [nounModifier(VELA), nounModifier(LEGNO, [], 'material')];
    expect(itMods(np(BARCA, {}, { nounModifiers: modifiers }))).toBe('a vela di legno');
  });

  test('drops a modifier with no surface', () => {
    expect(itMods(np(BARCA, {}, { nounModifiers: [nounModifier({}), nounModifier(VELA)] }))).toBe('a vela');
  });
});
