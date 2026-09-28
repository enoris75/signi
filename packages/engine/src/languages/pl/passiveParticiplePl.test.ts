import { describe, expect, test } from 'vitest';
import { passiveParticiplePl } from './passiveParticiplePl.js';
import { JESC, KOCHAC } from './pl.fixtures.js';

describe('passiveParticiplePl', () => {
  test('agrees with the patient, in the aspect asked for', () => {
    expect(passiveParticiplePl(JESC, true, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('zjedzona');
    expect(passiveParticiplePl(JESC, false, { person: '3', plural: false, gender: 'masc', virile: false })).toBe('jedzony');
    expect(passiveParticiplePl(JESC, true, { person: '3', plural: true, gender: 'masc', virile: true })).toBe('zjedzeni');
  });

  test('an unpaired verb has only the imperfective', () => {
    expect(passiveParticiplePl(KOCHAC, true, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('kochana');
  });
});
