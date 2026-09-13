import { describe, expect, test } from 'vitest';
import { ANGE, CHAT, HOMME, MAISON } from './fr.fixtures.js';
import { liaisonAdjectives } from './liaisonAdjectives.js';

describe('liaisonAdjectives', () => {
  test('beau, nouveau and vieux take bel, nouvel and vieil before a vowel or a mute h', () => {
    expect(liaisonAdjectives(['beau'], ANGE, 'ange', false)).toEqual(['bel']);
    expect(liaisonAdjectives(['vieux'], HOMME, 'homme', false)).toEqual(['vieil']);
    expect(liaisonAdjectives(['très beau'], ANGE, 'ange', false)).toEqual(['très bel']);
  });

  test('each adjective is judged against the word after it', () => {
    expect(liaisonAdjectives(['beau', 'vieux'], HOMME, 'homme', false)).toEqual(['beau', 'vieil']);
  });

  test('a consonant, the plural, the feminine and other adjectives keep their form', () => {
    expect(liaisonAdjectives(['vieux'], CHAT, 'chat', false)).toEqual(['vieux']);
    expect(liaisonAdjectives(['vieux'], HOMME, 'hommes', true)).toEqual(['vieux']);
    expect(liaisonAdjectives(['vieille'], { ...MAISON, base: 'aile' }, 'aile', false)).toEqual(['vieille']);
    expect(liaisonAdjectives(['grand'], ANGE, 'ange', false)).toEqual(['grand']);
  });
});
