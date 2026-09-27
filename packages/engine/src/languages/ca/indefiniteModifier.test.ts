import { describe, expect, test } from 'vitest';
import { concept, GRAN } from './ca.fixtures.js';
import { indefiniteModifierCa } from './indefiniteModifier.js';

describe('indefiniteModifierCa', () => {
  test('the adjective follows the pronoun in the masculine singular', () => {
    expect(indefiniteModifierCa('alguna cosa', 'alguna cosa', concept(GRAN), 'base')).toBe('alguna cosa gran');
  });

  test('OTHER is its after-pronoun word', () => {
    expect(indefiniteModifierCa('algú', 'algú', concept({ base: 'altre', after_pronoun: 'més' }), 'base')).toBe('algú més');
  });

  test('after res the adjective takes de', () => {
    expect(indefiniteModifierCa('res', 'alguna cosa', concept({ base: 'nou' }), 'base')).toBe('res de nou');
  });
});
