import { describe, expect, test } from 'vitest';
import { np, sayAll } from './harness.js';

// The adjective-definition gloss (C02): a *verbless* period marked `dimensionGloss`, whose subject
// is a bare noun phrase of a **dimension noun** carrying a **degree adjective** ("great size"),
// realised as a prepositional fragment — "of great size" / "di grande dimensione" / "von großer
// Größe". The degree adjective is agreed and positioned against the dimension noun by the ordinary
// noun-phrase machinery (so Italian gives "velocità alta" but "piccola velocità"); the construct
// only adds the adposition the head noun's `dimensionRelation` selects. Japanese has no adposition
// here — it renders the natural が-predicate "速さが高い". These pin the construct with already-seeded
// words (SPEED + HIGH / SMALL; SPEED declares no relation → the default `extent`); the natural
// dimension nouns (SIZE / QUALITY / …) and the per-adjective definitions are authored separately.

const gloss = (dimensionNoun: string, degree: string) =>
  sayAll({ subject: np(dimensionNoun, { adjectives: [degree], definiteness: 'bare', dimensionGloss: true }) });

describe('adjective-definition gloss (C02 fragment)', () => {
  // The flagship: a dimension noun + a degree adjective, wrapped in the per-language adposition.
  // SPEED declares no dimensionRelation, so it falls to the default `extent` — en/Romance "of"/"di"/
  // "de", de "von" (+ dative). The adjective binds to the noun, agreeing and placed by its own rules.
  test('a dimension noun with a degree ("of high speed")', () => {
    expect(gloss('SPEED', 'HIGH')).toEqual({
      en: 'of high speed.',
      it: 'di velocità alta.',
      fr: 'de vitesse haute.',
      es: 'de velocidad alta.',
      pt: 'de velocidade alta.',
      de: 'von hoher Geschwindigkeit.', // dative strong declension: hohe → hoher
      ja: '速さが高い。', // the dimension noun marked が, then the plain predicate adjective
    });
  });

  // A different adjective, pinning the per-language adjective *position* the shared NP path applies:
  // Italian moves "piccola" before the noun ("piccola velocità") where it kept "alta" after it.
  test('the degree adjective agrees and is placed by the NP path ("of small speed")', () => {
    expect(gloss('SPEED', 'SMALL')).toEqual({
      en: 'of small speed.',
      it: 'di piccola velocità.', // piccolo is prenominal in Italian, alto post-nominal
      fr: 'de petite vitesse.',
      es: 'de velocidad pequeña.',
      pt: 'de velocidade pequena.',
      de: 'von kleiner Geschwindigkeit.',
      ja: '速さが小さい。',
    });
  });

  // A na-adjective (慎重な) drops its attributive な in the Japanese が-predicate (速さが慎重),
  // the same strip the copula predicate does. (A mechanism guard, not a natural gloss.)
  test('a Japanese na-adjective drops its attributive な', () => {
    expect(gloss('SPEED', 'CAREFUL').ja).toBe('速さが慎重。');
  });

  // The `measure` dimension relation, on the seeded TEMPERATURE noun: a point reached on a scale, so
  // its adposition is "at" (en at / it-es-pt a / fr à / de bei) where the `extent` nouns take "of".
  // HIGH is regular in every language's feminine (haut → haute), so this pins the measure adposition
  // cleanly across all seven; TEMPERATURE is feminine in the Romance languages and German.
  test('a measure dimension ("at high temperature")', () => {
    expect(gloss('TEMPERATURE', 'HIGH')).toEqual({
      en: 'at high temperature.',
      it: 'a temperatura alta.',
      fr: 'à température haute.',
      es: 'a temperatura alta.',
      pt: 'a temperatura alta.',
      de: 'bei hoher Temperatur.',
      ja: '温度が高い。',
    });
  });

  // No degree adjective: the fragment is the bare dimension noun under its adposition, so the
  // construct degrades to "of speed" rather than throwing or dropping the preposition.
  test('a dimension gloss with no degree renders the bare dimension noun', () => {
    expect(sayAll({ subject: np('SPEED', { definiteness: 'bare', dimensionGloss: true }) })).toEqual({
      en: 'of speed.',
      it: 'di velocità.',
      fr: 'de vitesse.',
      es: 'de velocidad.',
      pt: 'de velocidade.',
      de: 'von Geschwindigkeit.',
      ja: '速さ。',
    });
  });
});
