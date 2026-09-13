import { describe, expect, test } from 'vitest';
import { adj, el, GESCHWINDIGKEIT, GROESSE, GROSS, HOCH, KLEIN, np, QUALITAET, type Forms } from './de.fixtures.js';
import { dimensionGloss } from './dimensionGloss.js';

const TEMPERATUR: Forms = { base: 'Temperatur', plural: 'Temperaturen', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };
const WERT: Forms = { base: 'Wert', plural: 'Werte', gender: 'masc', count: 'singular', dimensionRelation: 'quality' };

/** A bare dimension-noun gloss phrase, with its degree adjectives. */
const gloss = (forms: Forms, ...degrees: Forms[]) => {
  const phrase = np(forms, { definiteness: 'bare' }, { adjectives: degrees.map((d) => adj(d)), dimensionGloss: true });
  return dimensionGloss(phrase, el(phrase));
};

describe('dimensionGloss', () => {
  // With no article, the adjective carries the strong dative ending itself (-er / -em).
  test('extent and quality take "von" + the strong dative', () => {
    expect(gloss(GROESSE, GROSS)).toBe('von großer Größe');
    expect(gloss(QUALITAET, HOCH)).toBe('von hoher Qualität');
    expect(gloss(WERT, HOCH)).toBe('von hohem Wert');
  });

  test('measure takes "bei"', () => {
    expect(gloss(TEMPERATUR, HOCH)).toBe('bei hoher Temperatur');
  });

  test('a noun with no dimension relation defaults to extent', () => {
    expect(gloss(GESCHWINDIGKEIT, KLEIN)).toBe('von kleiner Geschwindigkeit');
  });

  test('without a degree the bare noun follows the preposition', () => {
    expect(gloss(GROESSE)).toBe('von Größe');
  });
});
