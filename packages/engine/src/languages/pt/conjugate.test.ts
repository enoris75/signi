import { describe, expect, test } from 'vitest';
import { COMER, ELA, ELES, EU, IR, NOS, SER, TORNAR_SE, VOCE } from './pt.fixtures.js';
import { conjugate } from './conjugate.js';

describe('conjugate', () => {
  test('picks the form for the subject’s person and number, in the present by default', () => {
    expect(conjugate(IR, EU)).toBe('vou');
    expect(conjugate(IR, ELA)).toBe('vai');
    expect(conjugate(IR, NOS)).toBe('vamos');
    expect(conjugate(SER, ELES)).toBe('são');
  });

  // Brazilian "você" takes third-person morphology, which the seeded 2sg forms of EAT carry.
  test('você agrees like a third person', () => {
    expect(conjugate(COMER, VOCE)).toBe('come');
  });

  test('a noun subject without person or number is third singular', () => {
    expect(conjugate(COMER, { base: 'gato', gender: 'masc' })).toBe('come');
    expect(conjugate(COMER, { base: 'gatos', number: 'plural' })).toBe('comem');
  });

  test('past and future', () => {
    expect(conjugate(SER, ELA, 'past')).toBe('foi');
    expect(conjugate(COMER, NOS, 'past')).toBe('comemos');
    expect(conjugate(IR, ELES, 'future')).toBe('irão');
    expect(conjugate(COMER, EU, 'future')).toBe('comerei');
  });

  test('a pronominal verb’s stored form already carries its clitic', () => {
    expect(conjugate(TORNAR_SE, ELA)).toBe('se torna');
    expect(conjugate(TORNAR_SE, EU, 'past')).toBe('me tornei');
  });

  test('falls back to a tense-wide form when the person form is missing', () => {
    expect(conjugate({ base: 'ser', past: 'foi' }, ELA, 'past')).toBe('foi');
  });

  test('falls back to the present when the tense has no form', () => {
    // Portuguese readily uses the present for a future ("amanhã ele come").
    expect(conjugate({ base: 'comer', '3sg_present': 'come' }, ELA, 'future')).toBe('come');
  });

  test('falls back to the infinitive, then to nothing', () => {
    expect(conjugate({ base: 'comer' }, ELES)).toBe('comer');
    expect(conjugate({}, ELA)).toBe('');
  });
});
