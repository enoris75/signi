import { describe, expect, test } from 'vitest';
import { ESTAR_AUX, ESTAR_PT, TER_AUX, TER_PT } from './pt.consts.js';
import { ELA, ELES, EU, NOS } from './pt.fixtures.js';
import { auxFinite } from './auxFinite.js';

describe('auxFinite', () => {
  test('without a mood, reads the auxiliary’s table for tense and person', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_PT, ELA, 'present')).toBe('está');
    expect(auxFinite(ESTAR_AUX, ESTAR_PT, EU, 'future')).toBe('estarei');
    expect(auxFinite(TER_AUX, TER_PT, ELES, 'present')).toBe('têm');
    expect(auxFinite(TER_AUX, TER_PT, NOS, 'future')).toBe('teremos');
  });

  // The progressive past is the imperfect ("estava comendo"), not the preterite.
  test('the past is the imperfect', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_PT, ELES, 'past')).toBe('estavam');
    expect(auxFinite(TER_AUX, TER_PT, EU, 'past')).toBe('tinha');
  });

  test('the conditional is built on the future stem, whatever the tense', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_PT, ELA, 'present', 'conditional')).toBe('estaria');
    expect(auxFinite(TER_AUX, TER_PT, NOS, 'past', 'conditional')).toBe('teríamos');
  });

  test('the imperfect subjunctive is built on the preterite stem', () => {
    expect(auxFinite(ESTAR_AUX, ESTAR_PT, ELA, 'present', 'subjunctive')).toBe('estivesse');
    expect(auxFinite(TER_AUX, TER_PT, ELES, 'present', 'subjunctive')).toBe('tivessem');
  });
});
