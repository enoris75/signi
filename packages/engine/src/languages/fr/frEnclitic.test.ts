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

  // A359: an affirmative command takes the object first, each pronoun hyphenated, me / te stressed.
  test('a cluster attaches object first', () => {
    expect(frEnclitic('donne', 'le lui', false, '2sg')).toBe('donne-le-lui');
    expect(frEnclitic('donne', 'le me', false, '2sg')).toBe('donne-le-moi');
    expect(frEnclitic('donnez', 'les leur', false, '2pl')).toBe('donnez-les-leur');
  });

  // localization B86: a pronominal verb's direct object (se rappeler) comes before its own pronoun.
  test('a third-person direct object precedes the reflexive pronoun', () => {
    expect(frEnclitic('te rappelle', 'le', true, '2sg')).toBe('rappelle-le-toi');
    expect(frEnclitic('vous rappelez', 'la', true, '2pl')).toBe('rappelez-la-vous');
    expect(frEnclitic('nous rappelons', 'les', true, '1pl')).toBe('rappelons-les-nous');
  });
});
