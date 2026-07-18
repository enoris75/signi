import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// The adverbial of manner (complemento di modo) — how an action is carried out. Its preposition
// is not chosen by the speaker: it follows the head noun's semantic manner relation, seeded on
// the concept. SPEED is a *measure* ("at the speed"), CARE a *means* ("with care"), WAY a *mode*
// ("in a … way"). It is a full noun phrase, so it takes a possessor and adjectives through the
// shared NP path.

const runManner = (phrase: ReturnType<typeof np>) =>
  sayAll(clause(np('CAT'), 'RUN', { complements: { manner: { phrase } } }));

describe('manner adverbial (complemento di modo)', () => {
  // similative → "like": the default an unmarked noun (WATER declares no relation) falls back to.
  test('similative — an unmarked noun takes "like" (the default)', () => {
    expect(runManner(np('WATER'))).toEqual({
      en: 'the cat runs like the water.',
      it: "il gatto corre come l'acqua.",
      fr: "le chat court comme l'eau.",
      es: 'el gato corre como el agua.',
      pt: 'o gato corre como a água.',
      de: 'der Kater läuft wie das Wasser.', // "wie" + nominative
      ja: '猫は水のように走ります。',
    });
  });

  // measure → "at": the flagship, with a genitive possessor ("at the speed of the light").
  test('measure — SPEED takes "at", with a possessor', () => {
    expect(runManner(np('SPEED', { possessor: np('LIGHT') }))).toEqual({
      en: "the cat runs at the light's speed.", // possessor renders as a Saxon genitive
      it: 'il gatto corre alla velocità della luce.',
      fr: 'le chat court à la vitesse de la lumière.',
      es: 'el gato corre a la velocidad de la luz.',
      pt: 'o gato corre à velocidade da luz.',
      de: 'der Kater läuft mit der Geschwindigkeit vom Licht.', // von-dative possessive
      ja: '猫は光の速さで走ります。',
    });
  });

  // measure → "at", with an adjective ("at high speed"). Bare determiner, so no article.
  test('measure — SPEED with an adjective ("at high speed")', () => {
    expect(runManner(np('SPEED', { adjectives: ['HIGH'], definiteness: 'bare' }))).toEqual({
      en: 'the cat runs at high speed.',
      it: 'il gatto corre a velocità alta.',
      fr: 'le chat court à vitesse haute.',
      es: 'el gato corre a velocidad alta.',
      pt: 'o gato corre a velocidade alta.',
      de: 'der Kater läuft mit hoher Geschwindigkeit.', // "hoch" declines from its attributive stem "hoh-"
      ja: '猫は高い速さで走ります。',
    });
  });

  // means → "with": the unmarked relation (CARE declares none explicitly → default means).
  test('means — CARE takes "with"', () => {
    expect(runManner(np('CARE', { definiteness: 'bare' }))).toEqual({
      en: 'the cat runs with care.',
      it: 'il gatto corre con cura.',
      fr: 'le chat court avec soin.',
      es: 'el gato corre con cuidado.',
      pt: 'o gato corre com cuidado.',
      de: 'der Kater läuft mit Sorgfalt.',
      ja: '猫は注意で走ります。',
    });
  });

  // mode → "in": WAY, with an adjective ("in a good way"). Indefinite, so the article stays.
  test('mode — WAY takes "in", with an adjective ("in a good way")', () => {
    expect(runManner(np('WAY', { adjectives: ['GOOD'], definiteness: 'indefinite' }))).toEqual({
      en: 'the cat runs in a good way.',
      it: 'il gatto corre in un buon modo.', // GOOD is prenominal in Italian (buono → buon)
      fr: "le chat court d'une bonne manière.",
      es: 'el gato corre de una manera buena.',
      pt: 'o gato corre de uma maneira boa.',
      de: 'der Kater läuft auf eine gute Weise.',
      ja: '猫は良い方法で走ります。',
    });
  });
});
