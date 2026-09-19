import { describe, expect, test } from 'vitest';
import { AGUA, CANSADO, clause, COMER, complement, complements, el, np, SE, SER, vp } from './pt.fixtures.js';
import type { Forms } from './pt.fixtures.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';

const CAPAZ: Forms = { role: 'adjective', base: 'capaz', infinitive_link: 'de' };
const ELE: Forms = { person: '3', number: 'singular', gender: 'masc' };
const ELA: Forms = { person: '3', number: 'singular', gender: 'fem' };

/**
 * An infinitive clause, as the translator resolves a complement: the infinitive mood, the controller's
 * subject. The copula is recognised by its concept id, which picks estar for a transient state.
 */
const inf = (verb: Forms, rest: Parameters<typeof clause>[2] = {}) =>
  clause(np(SE), vp(verb, { mood: 'infinitive' }, verb === SER ? 'BE' : 'TEST'), rest);
const predicate = (forms: Forms) => complements({ predicative: complement(np(forms)) });

describe('infinitiveComplementText', () => {
  test("the governor's link leads the bare infinitive", () => {
    expect(infinitiveComplementText(inf(COMER, { directObject: el(np(AGUA)) }), ELE, 'a')).toBe('a comer a água');
  });

  test('a governor with no link takes the bare infinitive', () => {
    expect(infinitiveComplementText(inf(COMER), ELE, '')).toBe('comer');
  });

  test('a predicate adjective agrees with the controller, and picks its copula', () => {
    expect(infinitiveComplementText(inf(SER, { complements: predicate(CANSADO) }), ELA, '')).toBe('estar cansada');
  });

  test('a clause that governs one in turn carries it along', () => {
    const able = inf(SER, { complements: predicate(CAPAZ), infinitiveComplement: inf(COMER) });
    expect(infinitiveComplementText(able, ELE, '')).toBe('ser capaz de comer');
  });
});
