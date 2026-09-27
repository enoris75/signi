import { describe, expect, test } from 'vitest';
import { adj, GAT, nounModifier, np, PARAULA, SEMANTIC } from './ca.fixtures.js';
import { caSurface } from './caSurface.js';
import { modifierText } from './modifierText.js';

describe('modifierText', () => {
  test('an attributive noun under a bare de, its adjectives agreeing with it', () => {
    expect(modifierText(np(GAT, {}, { nounModifiers: [nounModifier({ ...PARAULA, number: 'plural' }, [adj(SEMANTIC)])] }))).toBe(' de paraules semàntiques');
  });

  test('a domain takes the definite article', () => {
    expect(caSurface(modifierText(np(GAT, {}, { nounModifiers: [nounModifier(GAT, [], 'domain')] })))).toBe(' del gat');
  });
});
