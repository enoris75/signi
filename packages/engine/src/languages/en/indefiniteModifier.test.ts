import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierEn } from './indefiniteModifier.js';

describe('indefiniteModifierEn', () => {
  test('postposes the adjective', () => {
    expect(indefiniteModifierEn('something', 'something', adj({ base: 'big' }), 'base')).toBe('something big');
    expect(indefiniteModifierEn('nobody', 'someone', adj({ base: 'new' }), 'base')).toBe('nobody new');
  });

  test('OTHER is "else"', () => {
    expect(indefiniteModifierEn('anyone', 'someone', adj({ base: 'other', after_pronoun: 'else' }), 'object')).toBe('anyone else');
  });
});
