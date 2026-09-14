import { describe, expect, test } from 'vitest';
import { COMER, ELES, EU, GATO, NOS, TORNAR_SE, VOCE } from './pt.fixtures.js';
import { reflexiveClitic } from './reflexiveClitic.js';

describe('reflexiveClitic', () => {
  test('a non-reflexive verb has none', () => {
    expect(reflexiveClitic(COMER, GATO)).toBe('');
    expect(reflexiveClitic({}, EU)).toBe('');
  });

  test('a -se infinitive takes the clitic agreeing with its subject, você and vocês as the 3rd person', () => {
    expect(reflexiveClitic(TORNAR_SE, EU)).toBe('me');
    expect(reflexiveClitic(TORNAR_SE, VOCE)).toBe('se');
    expect(reflexiveClitic(TORNAR_SE, GATO)).toBe('se');
    expect(reflexiveClitic(TORNAR_SE, NOS)).toBe('nos');
    expect(reflexiveClitic(TORNAR_SE, { ...VOCE, number: 'plural' })).toBe('se');
    expect(reflexiveClitic(TORNAR_SE, ELES)).toBe('se');
  });
});
