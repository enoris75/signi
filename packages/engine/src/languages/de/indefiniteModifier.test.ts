import { describe, expect, test } from 'vitest';
import { adj } from '../resolved.fixtures.js';
import { indefiniteModifierDe } from './indefiniteModifier.js';

const GROSS = adj({ base: 'groß' });
const ANDERE = adj({ base: 'andere', after_pronoun: 'andere' });

describe('indefiniteModifierDe', () => {
  test('a capitalised neuter adjectival noun, strong, in the slot\'s case', () => {
    expect(indefiniteModifierDe('etwas', 'etwas', GROSS, 'base')).toBe('etwas Großes');
    expect(indefiniteModifierDe('etwas', 'etwas', GROSS, 'object')).toBe('etwas Großes');
    expect(indefiniteModifierDe('etwas', 'etwas', GROSS, 'disjunctive')).toBe('etwas Großem');
  });

  test('the pronoun stays undeclined before it', () => {
    expect(indefiniteModifierDe('jemanden', 'jemand', adj({ base: 'neu' }), 'object')).toBe('jemand Neues');
    expect(indefiniteModifierDe('niemandem', 'niemand', adj({ base: 'neu' }), 'disjunctive')).toBe('niemand Neuem');
  });

  test('OTHER is lowercase', () => {
    expect(indefiniteModifierDe('etwas', 'etwas', ANDERE, 'base')).toBe('etwas anderes');
    expect(indefiniteModifierDe('jemandem', 'jemand', ANDERE, 'disjunctive')).toBe('jemand anderem');
  });

  test('an irregular attributive stem declines as it does before a noun', () => {
    expect(indefiniteModifierDe('etwas', 'etwas', adj({ base: 'hoch', attributive: 'hoh' }), 'base')).toBe('etwas Hohes');
  });
});
