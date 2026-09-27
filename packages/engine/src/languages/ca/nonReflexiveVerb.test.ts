import { describe, expect, test } from 'vitest';
import { ATURAR_SE, concept, MENJAR, MOURE_S, TORNAR_SE } from './ca.fixtures.js';
import { isReflexive, nonReflexiveVerb } from './nonReflexiveVerb.js';

describe('nonReflexiveVerb', () => {
  test('strips the enclitic off the base and the proclitic off every finite cell', () => {
    const plain = nonReflexiveVerb(concept(TORNAR_SE)).forms;
    expect(plain['base']).toBe('tornar');
    expect(plain['3sg_present']).toBe('torna');
    expect(plain['1pl_future']).toBe('tornarem');
  });

  test('an elided proclitic and a vowel-final infinitive', () => {
    expect(nonReflexiveVerb(concept(ATURAR_SE)).forms['1sg_present']).toBe('aturo');
    expect(nonReflexiveVerb(concept(MOURE_S)).forms['base']).toBe('moure');
  });

  test('any other verb is returned as it is', () => {
    const verb = concept(MENJAR);
    expect(nonReflexiveVerb(verb)).toBe(verb);
    expect(isReflexive(MENJAR)).toBe(false);
    expect(isReflexive(MOURE_S)).toBe(true);
  });
});
