import { describe, expect, test } from 'vitest';
import { AVERE_AUX, AVERE_IT, ESSERE_AUX, ESSERE_IT, STARE_AUX, STARE_IT } from './it.consts.js';
import { GATTO, IO, LORO, NOI, TU } from './it.fixtures.js';
import { auxFinite } from './auxFinite.js';

describe('auxFinite', () => {
  test('without a mood, the tense form from the table', () => {
    expect(auxFinite(AVERE_AUX, AVERE_IT, GATTO, 'present')).toBe('ha');
    expect(auxFinite(ESSERE_AUX, ESSERE_IT, IO, 'present')).toBe('sono');
    expect(auxFinite(STARE_AUX, STARE_IT, NOI, 'future')).toBe('staremo');
  });

  test('the past is the imperfect: avevo mangiato, stavo andando', () => {
    expect(auxFinite(AVERE_AUX, AVERE_IT, IO, 'past')).toBe('avevo');
    expect(auxFinite(STARE_AUX, STARE_IT, LORO, 'past')).toBe('stavano');
  });

  test('the indicative mood keeps the tense form', () => {
    expect(auxFinite(ESSERE_AUX, ESSERE_IT, TU, 'past', 'indicative')).toBe('eri');
  });

  test('the conditional is built on the future stem, whatever the tense', () => {
    expect(auxFinite(AVERE_AUX, AVERE_IT, GATTO, 'present', 'conditional')).toBe('avrebbe');
    expect(auxFinite(ESSERE_AUX, ESSERE_IT, IO, 'past', 'conditional')).toBe('sarei');
    expect(auxFinite(STARE_AUX, STARE_IT, LORO, 'present', 'conditional')).toBe('starebbero');
  });

  test('the imperfect subjunctive, with the irregular essere and stare stems', () => {
    expect(auxFinite(AVERE_AUX, AVERE_IT, GATTO, 'present', 'subjunctive')).toBe('avesse');
    expect(auxFinite(ESSERE_AUX, ESSERE_IT, NOI, 'present', 'subjunctive')).toBe('fossimo');
    expect(auxFinite(STARE_AUX, STARE_IT, GATTO, 'present', 'subjunctive')).toBe('stesse');
  });
});
