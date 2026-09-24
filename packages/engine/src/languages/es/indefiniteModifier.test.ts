import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierEs } from './indefiniteModifier.js';

describe('indefiniteModifierEs', () => {
  test('postposes the adjective', () => {
    expect(indefiniteModifierEs('algo', 'algo', adj({ base: 'grande' }), 'base')).toBe('algo grande');
    expect(indefiniteModifierEs('nadie', 'nadie', adj({ base: 'nuevo' }), 'disjunctive')).toBe('nadie nuevo');
  });

  test('OTHER is "más" after a pronoun with no phrase of its own', () => {
    expect(indefiniteModifierEs('alguien', 'alguien', adj({ base: 'otro', after_pronoun: 'más' }), 'base')).toBe('alguien más');
  });
});
