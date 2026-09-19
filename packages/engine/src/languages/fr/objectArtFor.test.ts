import { describe, expect, test } from 'vitest';
import { AFRIQUE, ANGE, EAU, MOT, NOURRITURE, SOURIS } from './fr.fixtures.js';
import { objectArtFor } from './objectArtFor.js';

describe('objectArtFor', () => {
  test('an affirmative object has no zero article', () => {
    expect(objectArtFor({ ...SOURIS, definiteness: 'bare' }, true, 'souris', false)).toBe('des');
    expect(objectArtFor({ ...EAU, definiteness: 'bare' }, false, 'eau', false)).toBe("de l'");
    expect(objectArtFor({ ...SOURIS, definiteness: 'indefinite' }, false, 'souris', false)).toBe('une');
  });

  test('a negation turns the indefinite and the partitive into de', () => {
    expect(objectArtFor({ ...SOURIS, definiteness: 'indefinite' }, false, 'souris', true)).toBe('de');
    expect(objectArtFor({ ...SOURIS, definiteness: 'indefinite' }, true, 'souris', true)).toBe('de');
    expect(objectArtFor({ ...SOURIS, definiteness: 'bare' }, true, 'souris', true)).toBe('de');
    expect(objectArtFor({ ...NOURRITURE, definiteness: 'some' }, false, 'nourriture', true)).toBe('de');
  });

  test('eliding before a vowel sound', () => {
    expect(objectArtFor({ ...EAU, definiteness: 'bare' }, false, 'eau', true)).toBe("d'");
    expect(objectArtFor({ ...ANGE, definiteness: 'indefinite' }, true, 'anges', true)).toBe("d'");
  });

  test('the definite article, a demonstrative and a count quantifier stay under a negation', () => {
    expect(objectArtFor(SOURIS, false, 'souris', true)).toBe('la');
    expect(objectArtFor({ ...MOT, definiteness: 'this' }, false, 'mot', true)).toBe('ce');
    expect(objectArtFor({ ...MOT, definiteness: 'some' }, true, 'mots', true)).toBe('quelques');
    expect(objectArtFor({ ...MOT, definiteness: 'no' }, false, 'mot', true)).toBe('aucun');
  });

  test('a proper noun keeps its article under a negation', () => {
    expect(objectArtFor({ ...AFRIQUE, definiteness: 'indefinite' }, false, 'Afrique', true)).toBe("l'");
  });
});
