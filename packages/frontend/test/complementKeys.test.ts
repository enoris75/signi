import { describe, expect, it } from 'vitest';
import { COMPLEMENT_TYPES, type ComplementType } from '@signi/shared';
import { COMPLEMENT_KEYS } from '../src/components/PhraseBuilder/slots.ts';

// The *Add a complement* menu binds one letter per row: every complement the verb offers, and the
// object's fold-away on O (ComplementMenu). A verb may offer any of them together, so no two may
// share a letter (P09-E44 D5: the role left the object complement's E for Q; P09-E45's opponent is V).
describe('the complement menu’s letters', () => {
  it('gives every complement its own letter, none of them the object’s O', () => {
    const letters = (Object.keys(COMPLEMENT_KEYS) as ComplementType[]).map((type) => COMPLEMENT_KEYS[type]);

    expect(new Set([...letters, 'O']).size).toBe(letters.length + 1);
    for (const letter of letters) expect(letter).toMatch(/^[A-Z]$/);
  });

  it('binds every complement the builder offers', () => {
    for (const type of COMPLEMENT_TYPES) expect(COMPLEMENT_KEYS[type]).toBeDefined();
    expect(COMPLEMENT_KEYS.role).toBe('Q');
    expect(COMPLEMENT_KEYS.opponent).toBe('V');
  });
});
