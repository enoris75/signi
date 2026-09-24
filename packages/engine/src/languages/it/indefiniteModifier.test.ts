import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierIt } from './indefiniteModifier.js';

describe('indefiniteModifierIt', () => {
  test('"di" and the masculine singular', () => {
    expect(indefiniteModifierIt('qualcosa', 'qualcosa', adj({ base: 'grande' }), 'base')).toBe('qualcosa di grande');
    expect(indefiniteModifierIt('nessuno', 'nessuno', adj({ base: 'nuovo' }), 'object')).toBe('nessuno di nuovo');
  });

  test('OTHER without a fused form stands plainly after', () => {
    expect(indefiniteModifierIt('qualcuno', 'qualcuno', adj({ base: 'altro', after_pronoun: 'altro' }), 'base')).toBe('qualcuno altro');
  });
});
