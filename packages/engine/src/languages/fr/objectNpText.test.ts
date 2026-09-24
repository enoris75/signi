import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { concept, EAU, GRAND, LIVRE, MOT, np, SOURIS } from './fr.fixtures.js';
import { objectNpText } from './objectNpText.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };

describe('objectNpText', () => {
  test('a bare object takes the indefinite or partitive article', () => {
    expect(objectNpText(np(SOURIS, { definiteness: 'bare', number: 'plural' }), false)).toBe('des souris');
    expect(objectNpText(np(EAU, { definiteness: 'bare' }), false)).toBe("de l'eau");
    expect(objectNpText(np(SOURIS, { definiteness: 'bare', number: 'plural' }, { adjectives: [concept(GRAND, 'BIG')] }), false))
      .toBe('de grandes souris');
  });

  test('a negated one takes de', () => {
    expect(objectNpText(np(SOURIS, { definiteness: 'bare', number: 'plural' }), true)).toBe('de souris');
    expect(objectNpText(np(MOT, { definiteness: 'indefinite' }), true)).toBe('de mot');
    expect(objectNpText(np(EAU, { definiteness: 'indefinite' }), true)).toBe("d'eau");
    expect(objectNpText(np(LIVRE), true)).toBe('le livre');
  });

  test('a possessive takes the place of the article, whatever the polarity', () => {
    expect(objectNpText(np(LIVRE, {}, { possessor: his }), false)).toBe('son livre');
    expect(objectNpText(np(LIVRE, { definiteness: 'bare' }, { possessor: his }), true)).toBe('son livre');
  });

  // A327: a determiner kept beside a detached possessive is the object's own, and takes the negative de.
  test('a kept indefinite beside a detached possessive takes de when negated', () => {
    expect(objectNpText(np(LIVRE, { definiteness: 'indefinite' }, { possessor: his }), true)).toBe('de livre à lui');
    expect(objectNpText(np(EAU, { definiteness: 'indefinite' }, { possessor: his }), true)).toBe("d'eau à lui");
    expect(objectNpText(np(LIVRE, { definiteness: 'indefinite' }, { possessor: his }), false)).toBe('un livre à lui');
  });
});
