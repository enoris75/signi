import { describe, expect, test } from 'vitest';
import { adj, BOOK, CREATOR, np, nounModifier, PHRASE, SEMANTIC, WORD } from './en.fixtures.js';
import { nounMods } from './nounMods.js';

describe('nounMods', () => {
  test('a phrase with no attributive noun gives an empty string', () => {
    expect(nounMods(np(CREATOR))).toBe('');
  });

  test('the attributive noun is its bare base, whatever the relation', () => {
    expect(nounMods(np(CREATOR, {}, { nounModifiers: [nounModifier(PHRASE)] }))).toBe('phrase');
    expect(nounMods(np(BOOK, {}, { nounModifiers: [nounModifier(PHRASE, [], 'purpose')] }))).toBe('phrase');
  });

  test('stays singular even when the modifier is plural', () => {
    expect(nounMods(np(CREATOR, {}, { nounModifiers: [nounModifier({ ...PHRASE, number: 'plural' })] }))).toBe('phrase');
  });

  test('the modifier’s own adjectives stand bare before it', () => {
    expect(nounMods(np(CREATOR, {}, { nounModifiers: [nounModifier(PHRASE, [adj(SEMANTIC)])] }))).toBe('semantic phrase');
  });

  test('several modifiers are juxtaposed, and one with no base is skipped', () => {
    expect(nounMods(np(CREATOR, {}, { nounModifiers: [nounModifier(WORD), nounModifier({}), nounModifier(PHRASE)] }))).toBe('word phrase');
  });
});
