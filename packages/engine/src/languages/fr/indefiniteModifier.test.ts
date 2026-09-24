import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierFr } from './indefiniteModifier.js';

describe('indefiniteModifierFr', () => {
  test('"de" and the masculine singular', () => {
    expect(indefiniteModifierFr('quelque chose', 'quelque chose', adj({ base: 'grand' }), 'base')).toBe('quelque chose de grand');
    expect(indefiniteModifierFr('personne', 'personne', adj({ base: 'nouveau' }), 'object')).toBe('personne de nouveau');
  });

  test('elided before a vowel, OTHER included', () => {
    expect(indefiniteModifierFr('quelque chose', 'quelque chose', adj({ base: 'intéressant' }), 'base')).toBe("quelque chose d'intéressant");
    expect(indefiniteModifierFr("quelqu'un", "quelqu'un", adj({ base: 'autre', after_pronoun: 'autre' }), 'base')).toBe("quelqu'un d'autre");
  });
});
