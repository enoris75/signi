import { describe, expect, test } from 'vitest';
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
