import { describe, expect, test } from 'vitest';
import { adj, AUTER, GROND, NOV } from './rumgr.fixtures.js';
import { indefiniteModifierRumgr } from './indefiniteModifier.js';

describe('indefiniteModifierRumgr', () => {
  test('the adjective straight after the pronoun, in the masculine singular, no linking da', () => {
    expect(indefiniteModifierRumgr('insatge', 'insatge', adj(GROND), 'base')).toBe('insatge grond');
    expect(indefiniteModifierRumgr('nagut', 'insatge', adj(NOV), 'base')).toBe('nagut nov');
  });

  test('the form an adjective takes after a pronoun wins', () => {
    expect(indefiniteModifierRumgr('insatgi', 'insatgi', adj(AUTER), 'base')).toBe('insatgi auter');
    expect(indefiniteModifierRumgr('insatge', 'insatge', adj(NOV, { after_pronoun: 'nov' }), 'base')).toBe('insatge nov');
  });
});
