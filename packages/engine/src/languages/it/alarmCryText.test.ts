import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { ANGELO, FUOCO, LUPO, np } from './it.fixtures.js';
import { alarmCryText } from './alarmCryText.js';

const pronominal = (person: '1' | '2' | '3'): PronominalPossessor => ({ kind: 'pronominal', person, number: 'singular' });

describe('alarmCryText', () => {
  test('"a" fuses with the definite article', () => {
    expect(alarmCryText(np(LUPO))).toBe('al lupo');
    expect(alarmCryText(np(FUOCO))).toBe('al fuoco');
    expect(alarmCryText(np(LUPO, { number: 'plural' }))).toBe('ai lupi');
    expect(alarmCryText(np(ANGELO))).toBe("all'angelo");
  });

  test('any other determiner follows a plain "a"', () => {
    expect(alarmCryText(np(LUPO, { definiteness: 'indefinite' }))).toBe('a un lupo');
    expect(alarmCryText(np(LUPO, { definiteness: 'no' }))).toBe('a nessun lupo');
  });

  test('a possessive rides on the fused article', () => {
    expect(alarmCryText(np(LUPO, {}, { possessor: pronominal('3') }))).toBe('al suo lupo');
  });
});
