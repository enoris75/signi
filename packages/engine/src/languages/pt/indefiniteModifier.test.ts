import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierPt } from './indefiniteModifier.js';

describe('indefiniteModifierPt', () => {
  test('postposes the adjective', () => {
    expect(indefiniteModifierPt('algo', 'algo', adj({ base: 'grande' }), 'base')).toBe('algo grande');
    expect(indefiniteModifierPt('ninguém', 'ninguém', adj({ base: 'novo' }), 'object')).toBe('ninguém novo');
  });

  test('OTHER is "mais" after a pronoun with no phrase of its own', () => {
    expect(indefiniteModifierPt('nada', 'nada', adj({ base: 'outro', after_pronoun: 'mais' }), 'base')).toBe('nada mais');
  });
});
