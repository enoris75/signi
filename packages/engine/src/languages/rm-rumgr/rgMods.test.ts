import { describe, expect, test } from 'vitest';
import { adj, AUA, BARTGA, FERM, GIAT, nounModifier, np, UM, VELA } from './rumgr.fixtures.js';
import { rgMods } from './rgMods.js';

const FRITG = { base: 'fritg', plural: 'fritgs', gender: 'masc', count: 'singular' };
const SULEGL = { base: 'sulegl', plural: 'sulegls', gender: 'masc', count: 'singular' };

describe('rgMods', () => {
  test('nothing without attributive nouns', () => {
    expect(rgMods(np(BARTGA))).toBe('');
  });

  test('feature takes a, purpose and material da, with no article', () => {
    expect(rgMods(np(BARTGA, {}, { nounModifiers: [nounModifier(VELA)] }))).toBe('a vela');
    expect(rgMods(np(BARTGA, {}, { nounModifiers: [nounModifier(SULEGL, [], 'purpose')] }))).toBe('da sulegl');
    expect(rgMods(np(BARTGA, {}, { nounModifiers: [nounModifier(AUA, [], 'material')] }))).toBe('da aua');
  });

  test('a is ad before a vowel', () => {
    expect(rgMods(np(BARTGA, {}, { nounModifiers: [nounModifier(AUA)] }))).toBe('ad aua');
  });

  test('the modifier takes its own number, and its adjectives agree with it', () => {
    const velas = nounModifier({ ...VELA, number: 'plural' }, [adj(FERM)]);
    expect(rgMods(np(GIAT, {}, { nounModifiers: [velas] }))).toBe('a velas fermas');
  });

  test('a domain contracts its da with the definite article', () => {
    expect(rgMods(np(GIAT, {}, { nounModifiers: [nounModifier(FRITG, [], 'domain')] }))).toBe('dal fritg');
    expect(rgMods(np(GIAT, {}, { nounModifiers: [nounModifier(UM, [], 'domain')] }))).toBe("da l'um");
  });

  test('several modifiers follow one another; an empty one is dropped', () => {
    expect(rgMods(np(BARTGA, {}, { nounModifiers: [nounModifier(VELA), nounModifier({ gender: 'masc' })] }))).toBe('a vela');
  });
});
