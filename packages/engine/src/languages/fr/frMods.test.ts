import { describe, expect, test } from 'vitest';
import { adj, CREATEUR, EAU, FEU, FROID, MAISON, np, nounModifier, PHRASE, SEMANTIQUE } from './fr.fixtures.js';
import { frMods } from './frMods.js';

describe('frMods', () => {
  test('a feature noun follows bare after à, which never elides', () => {
    expect(frMods(np(MAISON, {}, { nounModifiers: [nounModifier(FEU, [], 'feature')] }))).toBe('à feu');
    expect(frMods(np(MAISON, {}, { nounModifiers: [nounModifier(EAU, [], 'feature')] }))).toBe('à eau');
  });

  test("a purpose or material noun follows de, elided to d' before a vowel", () => {
    expect(frMods(np(CREATEUR, {}, { nounModifiers: [nounModifier(PHRASE, [], 'purpose')] }))).toBe('de phrase');
    expect(frMods(np(MAISON, {}, { nounModifiers: [nounModifier(EAU, [], 'material')] }))).toBe("d'eau");
  });

  test('the modifier takes its own number and its adjectives agree with it, after it', () => {
    const phrases = nounModifier({ ...PHRASE, number: 'plural' }, [adj(SEMANTIQUE)], 'purpose');
    expect(frMods(np(CREATEUR, {}, { nounModifiers: [phrases] }))).toBe('de phrases sémantiques');
    // Elision keys on the modifier noun, which "de" immediately precedes.
    const coldWater = nounModifier(EAU, [adj(FROID)], 'purpose');
    expect(frMods(np(MAISON, {}, { nounModifiers: [coldWater] }))).toBe("d'eau froide");
  });

  test('no modifiers, or one with no noun, render nothing', () => {
    expect(frMods(np(MAISON))).toBe('');
    expect(frMods(np(MAISON, {}, { nounModifiers: [nounModifier({ gender: 'masc' }), nounModifier(FEU, [], 'feature')] }))).toBe('à feu');
  });
});
