import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { ANGE, FEU, type Forms, np } from './fr.fixtures.js';
import { alarmCryText } from './alarmCryText.js';

const LOUP: Forms = { base: 'loup', plural: 'loups', gender: 'masc', count: 'singular', animate: '1', alarm: '1' };
const pronominal = (person: '1' | '2' | '3'): PronominalPossessor => ({ kind: 'pronominal', person, number: 'singular' });

describe('alarmCryText', () => {
  test('"à" fuses with the definite article', () => {
    expect(alarmCryText(np(LOUP))).toBe('au loup');
    expect(alarmCryText(np(FEU))).toBe('au feu');
    expect(alarmCryText(np(LOUP, { number: 'plural' }))).toBe('aux loups');
    expect(alarmCryText(np(ANGE))).toBe("à l'ange");
  });

  test('any other determiner follows a plain "à"', () => {
    expect(alarmCryText(np(LOUP, { definiteness: 'indefinite' }))).toBe('à un loup');
    expect(alarmCryText(np(LOUP, { definiteness: 'no' }))).toBe('à aucun loup');
  });

  test('a possessive takes a plain "à"', () => {
    expect(alarmCryText(np(LOUP, {}, { possessor: pronominal('3') }))).toBe('à son loup');
  });
});
