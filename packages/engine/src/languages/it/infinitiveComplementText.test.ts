import { describe, expect, test } from 'vitest';
import { CIBO, clause, complement, complements, el, ESSERE, GATTA, GATTO, MANGIARE, np, SI, STANCO, vp } from './it.fixtures.js';
import type { Forms } from './it.fixtures.js';
import { infinitiveComplementText } from './infinitiveComplementText.js';

const AGIRE: Forms = { base: 'agire', '3sg_present': 'agisce' };
const CAPACE: Forms = { role: 'adjective', base: 'capace', infinitive_link: 'di' };

/** An infinitive clause, as the translator resolves a complement: the infinitive mood, the controller's subject. */
const inf = (verb: Forms, rest: Parameters<typeof clause>[2] = {}) => clause(np(SI), vp(verb, { mood: 'infinitive' }), rest);
const predicate = (forms: Forms) => complements({ predicative: complement(np(forms)) });

describe('infinitiveComplementText', () => {
  test("the governor's link leads the bare infinitive", () => {
    expect(infinitiveComplementText(inf(MANGIARE, { directObject: el(np(CIBO)) }), GATTO, 'di')).toBe('di mangiare il cibo');
  });

  test('a governor with no link takes the bare infinitive', () => {
    expect(infinitiveComplementText(inf(MANGIARE), GATTO, '')).toBe('mangiare');
  });

  test('"a" takes the euphonic d before another a only', () => {
    expect(infinitiveComplementText(inf(AGIRE), GATTO, 'a')).toBe('ad agire');
    expect(infinitiveComplementText(inf(MANGIARE), GATTO, 'a')).toBe('a mangiare');
    expect(infinitiveComplementText(inf(ESSERE, { complements: predicate(STANCO) }), GATTO, 'a')).toBe('a essere stanco');
  });

  test('a predicate adjective agrees with the controller', () => {
    expect(infinitiveComplementText(inf(ESSERE, { complements: predicate(STANCO) }), GATTA, '')).toBe('essere stanca');
  });

  test('a clause that governs one in turn carries it along', () => {
    const able = inf(ESSERE, { complements: predicate(CAPACE), infinitiveComplement: inf(AGIRE) });
    expect(infinitiveComplementText(able, GATTO, '')).toBe('essere capace di agire');
  });
});
