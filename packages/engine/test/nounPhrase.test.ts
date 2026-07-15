import { describe, expect, test } from 'vitest';
import type { Definiteness } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// Determiners, number, and the two noun classes that override the user's choice of article:
// mass nouns and proper nouns.
describe('determiners', () => {
  test('indefinite', () => {
    expect(sayAll(clause(np('CAT', { definiteness: 'indefinite' }), 'EAT'))).toEqual({
      en: 'a cat eats.',
      it: 'un gatto mangia.',
      fr: 'un chat mange.',
      es: 'un gato come.',
      pt: 'um gato come.',
      de: 'ein Kater isst.',
      ja: '猫は食べます。', // Japanese has no articles
    });
  });

  test('a proper noun takes the article the language fixes, not the one chosen', () => {
    // en/de/es/ja take none; it/fr/pt take the definite one — a fact about the language, so
    // the determiner on the plan is ignored for this head.
    expect(sayAll(clause(np('EUROPE'), 'EAT'))).toEqual({
      en: 'Europe eats.',
      it: "l'Europa mangia.",
      fr: "l'Europe mange.",
      es: 'Europa come.',
      pt: 'a Europa come.',
      de: 'Europa isst.',
      ja: 'ヨーロッパは食べます。',
    });
  });

  test('a mass noun does not pluralise', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('WATER') }))).toMatchObject({
      en: 'the cat eats the water.',
      it: "il gatto mangia l'acqua.",
      de: 'der Kater isst das Wasser.',
    });
  });

  test('the article elides before a vowel', () => {
    expect(sayAll(clause(np('ANGEL'), 'EAT'))).toMatchObject({
      fr: "l'ange mange.",
      it: "l'angelo mangia.",
      es: 'el ángel come.', // Spanish does not elide
    });

    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('WATER') }))).toMatchObject({
      fr: "le chat voit l'eau.",
      it: "il gatto vede l'acqua.",
    });
  });

  test('plural indefinite', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE', { number: 'plural', definiteness: 'indefinite' }),
    }))).toEqual({
      // English, Italian and German drop the article for an indefinite plural…
      en: 'the cat eats mice.',
      it: 'il gatto mangia topi.',
      de: 'der Kater isst Mäuse.',
      // …French needs its partitive, and Iberian Romance uses the plural indefinite.
      fr: 'le chat mange des souris.',
      es: 'el gato come unos ratones.',
      pt: 'o gato come uns ratos.',
      ja: '猫はネズミを食べます。',
    });
  });
});

describe('known bugs: determiners', () => {
  // French elides before a vowel (l'ange, l'eau — asserted above) but NOT before a silent h, and
  // "homme" begins with one: h muet is not pronounced, so the article elides exactly as it would
  // before a vowel. The engine tests the first LETTER rather than the first SOUND, so it emits
  // "le homme" — and the same miss propagates into every contraction built on the article
  // ("du homme" for "de l'homme").
  //
  // Italian gets the equivalent right (l'uomo, dell'uomo), so this is French-specific. Fixing it
  // needs the h-muet / h-aspiré distinction, which is lexical — "homme" elides, "héros" does not
  // ("le héros") — so it belongs on the noun lexeme in the corpus, not in a rule.
  test.fails('French should elide before a silent h: "l\'homme", not "le homme"', () => {
    expect(sayAll(clause(np('MAN'), 'EAT'))).toMatchObject({ fr: "l'homme mange." });
  });

  test.fails('the miss propagates into the contracted forms: "de l\'homme", not "du homme"', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('MAN') }), 'BURN')))
      .toMatchObject({ fr: "le livre de l'homme brûle." });
  });
});

// A mass (uncountable) noun does not just block the plural — it takes DIFFERENT quantifier words.
// English splits many/much and few/little on countability; the Romance and German quantifiers
// change form or become a partitive. WATER is the mass noun; MOUSE the count noun for contrast.
describe('mass nouns and quantifiers', () => {
  const water = (definiteness: Definiteness) =>
    sayAll(clause(np('CAT'), 'DRINK', { directObject: np('WATER', { definiteness }) }));
  const mouse = (definiteness: Definiteness) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: np('MOUSE', { definiteness }) }));

  test('English says "much / little" for mass where a count noun takes "many / few"', () => {
    expect(water('many')).toMatchObject({
      en: 'the cat drinks much water.', // much, not "many"
      it: 'il gatto beve molta acqua.', // molta (fem sg), not molti
      fr: "le chat boit beaucoup d'eau.",
      es: 'el gato bebe mucha agua.',
      pt: 'o gato bebe muita água.',
      de: 'der Kater trinkt viel Wasser.', // viel (uninflected), not viele
    });
    expect(water('few')).toMatchObject({
      en: 'the cat drinks little water.', // little, not "few"
      it: 'il gatto beve poca acqua.',
      fr: "le chat boit peu d'eau.",
      de: 'der Kater trinkt wenig Wasser.', // wenig, not wenige
    });
    // The count noun takes the count words, and pluralises.
    expect(mouse('many')).toMatchObject({ en: 'the cat sees many mice.', it: 'il gatto vede molti topi.', de: 'der Kater sieht viele Mäuse.' });
    expect(mouse('few')).toMatchObject({ en: 'the cat sees few mice.', de: 'der Kater sieht wenige Mäuse.' });
  });

  test('the mass "some" is a partitive, not the count "some"', () => {
    // Mass: a partitive quantity — English "some", Italian the partitive article "dell'", French
    // "de l'", Spanish/Portuguese a "…de" phrase, German "etwas".
    expect(water('some')).toMatchObject({
      en: 'the cat drinks some water.',
      it: "il gatto beve dell'acqua.", // di + l' = dell' — the partitive
      fr: "le chat boit de l'eau.",
      es: 'el gato bebe algo de agua.',
      pt: 'o gato bebe um pouco de água.',
      de: 'der Kater trinkt etwas Wasser.',
    });
    // Count: the enumerating "some" — a few individuals, pluralised.
    expect(mouse('some')).toMatchObject({
      en: 'the cat sees some mice.',
      it: 'il gatto vede alcuni topi.', // alcuni, not dell'
      fr: 'le chat voit quelques souris.',
      de: 'der Kater sieht einige Mäuse.',
    });
  });

  test('a mass noun takes no indefinite article — "water", not "a water"', () => {
    expect(water('indefinite')).toMatchObject({
      en: 'the cat drinks water.', // not "a water"
      it: 'il gatto beve acqua.',
      fr: "le chat boit de l'eau.", // French fills the slot with the partitive
      es: 'el gato bebe agua.',
      de: 'der Kater trinkt Wasser.',
    });
    // The count noun does take one.
    expect(mouse('indefinite')).toMatchObject({ en: 'the cat sees a mouse.', it: 'il gatto vede un topo.' });
  });

  test('every quantifier keeps the mass noun singular', () => {
    // The count noun pluralises under some/many/few ("mice", "topi"); the mass noun never does.
    for (const q of ['some', 'many', 'few', 'all'] as const) {
      expect(water(q).en).toContain('water'); // never "waters"
      expect(water(q).it).toContain('acqua'); // never "acque"
      expect(water(q).de).toContain('Wasser');
    }
  });

  test('the article-bearing determiners work on a mass noun', () => {
    expect(water('definite')).toMatchObject({ en: 'the cat drinks the water.', it: "il gatto beve l'acqua." });
    expect(water('this')).toMatchObject({ en: 'the cat drinks this water.', it: "il gatto beve quest'acqua.", de: 'der Kater trinkt dieses Wasser.' });
  });
});
