import { describe, expect, test } from 'vitest';
import { frEnclitic } from './frEnclitic.js';

describe('frEnclitic', () => {
  test('an object pronoun follows the verb, me / te in their stressed form', () => {
    expect(frEnclitic('vois', 'me', false, '2sg')).toBe('vois-moi');
    expect(frEnclitic('ajoute', 'le', false, '2sg')).toBe('ajoute-le');
    expect(frEnclitic('voyez', 'nous', false, '2pl')).toBe('voyez-nous');
  });

  test('a reflexive verb moves its clitic behind it, by person', () => {
    expect(frEnclitic("t'effondre", '', true, '2sg')).toBe('effondre-toi');
    expect(frEnclitic('nous effondrons', '', true, '1pl')).toBe('effondrons-nous');
    expect(frEnclitic('vous effondrez', '', true, '2pl')).toBe('effondrez-vous');
  });

  test('a plain verb with no pronoun is unchanged', () => {
    expect(frEnclitic('cours', '', false, '2sg')).toBe('cours');
  });
});
