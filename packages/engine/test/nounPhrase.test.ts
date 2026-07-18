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

  test('MONEY is a mass noun — keeps its gender and never pluralises', () => {
    // Forcing number:'plural' on the object leaves it singular in every language.
    expect(sayAll(clause(np('CAT'), 'DRINK', {
      directObject: np('MONEY', { number: 'plural' }),
    }))).toEqual({
      en: 'the cat drinks the money.',
      it: 'il gatto beve il denaro.',
      fr: "le chat boit l'argent.", // masc, but elides before a vowel
      es: 'el gato bebe el dinero.',
      pt: 'o gato bebe o dinheiro.',
      de: 'der Kater trinkt das Geld.',
      ja: '猫はお金を飲みます。',
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
  // French elides before a vowel (l'ange, l'eau — asserted above) AND before a silent h, and
  // "homme" begins with one: h muet is not pronounced, so the article elides exactly as it would
  // before a vowel. The engine now consults the noun's lexical `elides` flag (the sound), not just
  // the first letter, so it emits "l'homme" — and the fix propagates into every contraction built
  // on the article ("de l'homme").
  //
  // Italian gets the equivalent right (l'uomo, dell'uomo). The h-muet / h-aspiré distinction is
  // lexical — "homme" elides, "héros" would not ("le héros") — so it lives on the noun lexeme in
  // the corpus, not in a rule.
  test('French elides before a silent h: "l\'homme", not "le homme"', () => {
    expect(sayAll(clause(np('MAN'), 'EAT'))).toMatchObject({ fr: "l'homme mange." });
  });

  test('the fix propagates into the contracted forms: "de l\'homme", not "du homme"', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('MAN') }), 'BURN')))
      .toMatchObject({ fr: "le livre de l'homme brûle." });
  });

  // The demonstrative elides its sound too: "cet homme", the form it takes before any vowel sound.
  test('French uses "cet" before a silent h: "cet homme"', () => {
    expect(sayAll(clause(np('MAN', { definiteness: 'this' }), 'EAT')).fr).toBe('cet homme mange.');
  });

  // The indefinite article does NOT elide ("un" has no euphonic variant), and the plural takes
  // "les" — neither is touched by the elision flag.
  test('French keeps "un homme" and "les hommes" — no article elides there', () => {
    expect(sayAll(clause(np('MAN', { definiteness: 'indefinite' }), 'EAT')).fr).toBe('un homme mange.');
    expect(sayAll(clause(np('MAN', { number: 'plural' }), 'EAT')).fr).toBe('les hommes mangent.');
  });

  // The flag is the head noun's and fires only when the noun itself leads: a nested possessor still
  // contracts on each head ("du père de l'homme"), and a leading prenominal adjective blocks the
  // elision on its own consonant ("le jeune homme"), leaving the article un-elided.
  test('French honours the elision flag only when the noun leads the article', () => {
    expect(sayAll(clause(np('BOOK', { possessor: np('FATHER', { possessor: np('MAN') }) }), 'BURN')).fr)
      .toBe("le livre du père de l'homme brûle.");
    expect(sayAll(clause(np('YOUNG_MAN'), 'EAT')).fr).toBe('le jeune homme mange.');
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
