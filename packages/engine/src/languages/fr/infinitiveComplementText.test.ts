import { describe, expect, test } from 'vitest';
import { clause, el, FATIGUE, MANGER, np, NOURRITURE, ON, vp, complement, complements, ETRE } from './fr.fixtures.js';
import type { Forms } from './fr.fixtures.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';

const AGIR: Forms = { base: 'agir', '3sg_present': 'agit' };
const CAPABLE: Forms = { role: 'adjective', base: 'capable', infinitive_link: 'de' };
const IL: Forms = { person: '3', number: 'singular', gender: 'masc' };
const ELLE: Forms = { person: '3', number: 'singular', gender: 'fem' };

/** An infinitive clause, as the translator resolves a complement: the infinitive mood, the controller's subject. */
const inf = (verb: Forms, rest: Parameters<typeof clause>[2] = {}) => clause(np(ON), vp(verb, { mood: 'infinitive' }), rest);
const predicate = (forms: Forms) => complements({ predicative: complement(np(forms)) });

describe('infinitiveComplementText', () => {
  test("the governor's link leads the bare infinitive", () => {
    expect(infinitiveComplementText(inf(MANGER, { directObject: el(np(NOURRITURE)) }), IL, 'de')).toBe('de manger la nourriture');
  });

  test('"de" elides before a vowel, but not before the "ne" of a negated infinitive', () => {
    expect(infinitiveComplementText(inf(AGIR), IL, 'de')).toBe("d'agir");
    expect(infinitiveComplementText(clause(np(ON), vp(AGIR, { mood: 'infinitive', negative: true })), IL, 'de')).toBe('de ne pas agir');
  });

  test('a governor with no link takes the bare infinitive', () => {
    expect(infinitiveComplementText(inf(AGIR), IL, '')).toBe('agir');
  });

  test('a predicate adjective agrees with the controller', () => {
    expect(infinitiveComplementText(inf(ETRE, { complements: predicate(FATIGUE) }), ELLE, '')).toBe('être fatiguée');
  });

  test('a clause that governs one in turn carries it along', () => {
    const able = inf(ETRE, { complements: predicate(CAPABLE), infinitiveComplement: inf(AGIR) });
    expect(infinitiveComplementText(able, IL, '')).toBe("être capable d'agir");
  });
});
