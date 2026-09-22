import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { CASA, HOMBRE, MUJER, NINO, np, PERRO } from './es.fixtures.js';
import { objectNounText } from './objectNounText.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular' };

describe('objectNounText', () => {
  test('a human takes the personal a, fused with its determiner', () => {
    expect(objectNounText(np(NINO))).toBe('al niño');
    expect(objectNounText(np(MUJER))).toBe('a la mujer');
    expect(objectNounText(np(HOMBRE, { definiteness: 'indefinite' }))).toBe('a un hombre');
    expect(objectNounText(np(NINO, { definiteness: 'no' }))).toBe('a ningún niño');
    expect(objectNounText(np(HOMBRE, { number: 'plural' }))).toBe('a los hombres');
    expect(objectNounText(np(NINO, {}, { possessor: his }))).toBe('a su niño');
  });

  // FOLLOW's seguir marks every determined object with a (`object_a`, localization C24).
  test('a verb that marks every object gives a non-human the a too', () => {
    expect(objectNounText(np(PERRO), { object_a: '1' })).toBe('al perro');
    expect(objectNounText(np(CASA, { definiteness: 'indefinite' }), { object_a: '1' })).toBe('a una casa');
  });

  test('a bare human and a non-human keep the plain noun phrase', () => {
    expect(objectNounText(np(NINO, { number: 'plural', definiteness: 'bare' }))).toBe('niños');
    expect(objectNounText(np(PERRO))).toBe('el perro');
    expect(objectNounText(np(CASA, { definiteness: 'indefinite' }))).toBe('una casa');
  });
});
