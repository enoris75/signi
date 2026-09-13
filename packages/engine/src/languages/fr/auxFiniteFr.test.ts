import { describe, expect, test } from 'vitest';
import { AVOIR_AUX, AVOIR_FR, ETRE_AUX, ETRE_FR } from './fr.consts.js';
import { CHAT, IL, JE, TU } from './fr.fixtures.js';
import { auxFiniteFr } from './auxFiniteFr.js';

describe('auxFiniteFr', () => {
  test('without a mood, reads the tense table by person and number', () => {
    expect(auxFiniteFr(ETRE_AUX, ETRE_FR, IL, 'present')).toBe('est');
    expect(auxFiniteFr(ETRE_AUX, ETRE_FR, JE, 'past')).toBe('étais');
    expect(auxFiniteFr(ETRE_AUX, ETRE_FR, { ...CHAT, number: 'plural' }, 'future')).toBe('seront');
    expect(auxFiniteFr(AVOIR_AUX, AVOIR_FR, TU, 'present')).toBe('as');
    expect(auxFiniteFr(AVOIR_AUX, AVOIR_FR, { ...JE, number: 'plural' }, 'past')).toBe('avions');
  });

  test('the conditional is built on the future stem, whatever the tense', () => {
    expect(auxFiniteFr(ETRE_AUX, ETRE_FR, IL, 'present', 'conditional')).toBe('serait');
    expect(auxFiniteFr(AVOIR_AUX, AVOIR_FR, { ...JE, number: 'plural' }, 'past', 'conditional')).toBe('aurions');
  });

  test('the protasis takes the imparfait', () => {
    expect(auxFiniteFr(ETRE_AUX, ETRE_FR, IL, 'present', 'subjunctive')).toBe('était');
    expect(auxFiniteFr(AVOIR_AUX, AVOIR_FR, { ...CHAT, number: 'plural' }, 'present', 'subjunctive')).toBe('avaient');
  });
});
