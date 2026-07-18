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

  // The manner adverbial is licensed on every dynamic verb class, not just the intransitive RUN.
  // It sits with the other complements in the shared render order, so these fix its placement
  // alongside a direct object, a motion path, a dative, and a modal chain.
  describe('across verb classes', () => {
    // Transitive: after the direct object ("eats the food with care").
    test('transitive verb (EAT) — after the direct object', () => {
      expect(
        sayAll(clause(np('CAT'), 'EAT', {
          directObject: np('FOOD'),
          complements: { manner: { phrase: np('CARE', { definiteness: 'bare' }) } },
        })),
      ).toEqual({
        en: 'the cat eats the food with care.',
        it: 'il gatto mangia il cibo con cura.',
        fr: 'le chat mange la nourriture avec soin.',
        es: 'el gato come la comida con cuidado.',
        pt: 'o gato come a comida com cuidado.',
        de: 'der Kater isst das Essen mit Sorgfalt.',
        ja: '猫は注意で食べ物を食べます。', // SOV: the manner complement precedes the direct object
      });
    });

    // Motion: manner precedes the path complement (COMPLEMENT_RENDER_ORDER: manner before direction).
    test('motion verb (GO) — manner before the direction', () => {
      expect(
        sayAll(clause(np('CAT'), 'GO', {
          complements: {
            manner: { phrase: np('FOX') },
            direction: { phrase: np('HOUSE') },
          },
        })),
      ).toEqual({
        en: 'the cat goes like the fox to the house.',
        it: 'il gatto va come la volpe alla casa.',
        fr: 'le chat va comme le renard à la maison.',
        es: 'el gato va como el zorro a la casa.',
        pt: 'o gato vai como a raposa à casa.',
        de: 'der Kater geht wie der Fuchs zum Haus.', // zu + dem → zum
        ja: '猫はキツネのように家へ行きます。',
      });
    });

    // Ditransitive: the dative terminus precedes the manner (terminus before manner in the order).
    test('ditransitive verb (GIVE) — after the object and dative', () => {
      expect(
        sayAll(clause(np('CAT'), 'GIVE', {
          directObject: np('BOOK'),
          complements: {
            terminus: { phrase: np('DOG') },
            manner: { phrase: np('CARE', { definiteness: 'bare' }) },
          },
        })),
      ).toEqual({
        en: 'the cat gives the book to the dog with care.',
        it: 'il gatto dà il libro al cane con cura.',
        fr: 'le chat donne le livre au chien avec soin.',
        es: 'el gato da el libro al perro con cuidado.',
        pt: 'o gato dá o livro ao cão com cuidado.',
        de: 'der Kater gibt dem Hund das Buch mit Sorgfalt.', // dative precedes accusative
        ja: '猫は犬に注意で本をあげます。',
      });
    });

    // Modal: the manner belongs to the clause, so it renders under a modal chain too ("must run …").
    test('modal chain (MUST + RUN) — manner still renders', () => {
      expect(
        sayAll(clause(np('CAT'), 'RUN', {
          verbPhrase: { modals: ['MUST'] },
          complements: { manner: { phrase: np('SPEED', { definiteness: 'bare' }) } },
        })),
      ).toEqual({
        en: 'the cat must run at speed.',
        it: 'il gatto deve correre a velocità.',
        fr: 'le chat doit courir à vitesse.',
        es: 'el gato debe correr a velocidad.',
        pt: 'o gato deve correr a velocidade.',
        de: 'der Kater muss mit Geschwindigkeit laufen.',
        ja: '猫は速さで走る必要があります。',
      });
    });
  });
});
