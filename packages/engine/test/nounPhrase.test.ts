import { describe, expect, test } from 'vitest';
import type { Definiteness, NounPhrase } from '@signi/shared';
import { clause, furigana, np, say, sayAll } from './harness.js';

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
      de: 'ein Kater frisst.',
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
      de: 'der Kater frisst das Wasser.',
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

  // The mass differentia nouns: PROPERTY (possessions) and AFFECTION. Like MONEY they keep their
  // gender and never pluralise; as mass nouns they take no indefinite article (French fills the
  // slot with the partitive) and the mass quantifier words ("much", "molto", "viel").
  test('PROPERTY and AFFECTION are mass nouns — gendered, never plural, no indefinite article', () => {
    const sees = (id: string, extra: Partial<NounPhrase>) =>
      sayAll(clause(np('CAT'), 'SEE', { directObject: np(id, extra) }));

    expect(sees('PROPERTY', { number: 'plural' })).toEqual({
      en: 'the cat sees the property.',
      it: 'il gatto vede la proprietà.',
      fr: 'le chat voit la propriété.',
      es: 'el gato ve la propiedad.',
      pt: 'o gato vê a propriedade.',
      de: 'der Kater sieht den Besitz.', // masculine accusative
      ja: '猫は財産を見ます。',
    });
    expect(sees('PROPERTY', { definiteness: 'indefinite' })).toEqual({
      en: 'the cat sees property.',
      it: 'il gatto vede proprietà.',
      fr: 'le chat voit de la propriété.',
      es: 'el gato ve propiedad.',
      pt: 'o gato vê propriedade.',
      de: 'der Kater sieht Besitz.',
      ja: '猫は財産を見ます。',
    });
    expect(sees('PROPERTY', { definiteness: 'many' })).toMatchObject({
      en: 'the cat sees much property.',
      it: 'il gatto vede molta proprietà.',
      fr: 'le chat voit beaucoup de propriété.',
      es: 'el gato ve mucha propiedad.',
      pt: 'o gato vê muita propriedade.',
      de: 'der Kater sieht viel Besitz.',
    });

    expect(sees('AFFECTION', { number: 'plural' })).toEqual({
      en: 'the cat sees the affection.',
      it: "il gatto vede l'affetto.", // vowel-initial: the article elides
      fr: "le chat voit l'affection.",
      es: 'el gato ve el afecto.',
      pt: 'o gato vê o afeto.',
      de: 'der Kater sieht die Zuneigung.',
      ja: '猫は愛情を見ます。',
    });
    expect(sees('AFFECTION', { definiteness: 'indefinite' })).toEqual({
      en: 'the cat sees affection.',
      it: 'il gatto vede affetto.',
      fr: "le chat voit de l'affection.",
      es: 'el gato ve afecto.',
      pt: 'o gato vê afeto.',
      de: 'der Kater sieht Zuneigung.',
      ja: '猫は愛情を見ます。',
    });
    expect(sees('AFFECTION', { definiteness: 'some' })).toMatchObject({
      en: 'the cat sees some affection.',
      it: "il gatto vede dell'affetto.", // the partitive
      fr: "le chat voit de l'affection.",
      es: 'el gato ve algo de afecto.',
      pt: 'o gato vê um pouco de afeto.',
      de: 'der Kater sieht etwas Zuneigung.',
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
      de: 'der Kater frisst Mäuse.',
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

// AIR, the mass noun JUMP's gloss is built on (C18). Its gender differs across the Romance
// languages — feminine in Italian, masculine in the other three — and both Italian and French
// elide their article against its initial vowel, which is what the gloss reads as "nell'aria" and
// "dans l'air". German's Luft is feminine, so the accusative of motion into it is "die Luft".
describe('AIR', () => {
  const air = (extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: np('AIR', extra) }));

  test('the article agrees, and elides where the language elides', () => {
    expect(air()).toEqual({
      en: 'the cat sees the air.',
      it: "il gatto vede l'aria.", // feminine, elided
      fr: "le chat voit l'air.", // masculine, elided
      de: 'der Kater sieht die Luft.', // feminine, accusative
      es: 'el gato ve el aire.',
      ja: '猫は空気を見ます。',
      pt: 'o gato vê o ar.',
    });
  });

  test('it is a mass noun, so it takes the mass quantifiers and no plural', () => {
    expect(air({ definiteness: 'many' })).toMatchObject({
      en: 'the cat sees much air.', // much, not "many airs"
      it: 'il gatto vede molta aria.',
      de: 'der Kater sieht viel Luft.',
    });
    expect(air({ definiteness: 'indefinite' })).toMatchObject({
      en: 'the cat sees air.', // no article: a mass noun's indefinite is bare
      fr: "le chat voit de l'air.", // French spells its partitive
    });
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

// A56. The adjective ending table is chosen from the determiner alone (`endingsFor`), so it cannot
// tell that a mass noun takes no article where a count noun would: an "indefinite" mass noun is
// article-less, and "etwas" is invariant. With nothing carrying the case, the adjective declines
// strong ("mit kaltem Wasser"); the engine gives it the weak dative -en instead.
describe('known bugs: German adjective on an article-less mass noun', () => {
  const eatsWith = (definiteness: Definiteness) => sayAll(clause(np('CAT'), 'EAT', {
    complements: { instrumental: { phrase: np('WATER', { definiteness, adjectives: ['COLD'] }) } },
  })).de;

  test('German declines the adjective strong after etwas and with no article', () => {
    expect(eatsWith('some')).toBe('der Kater frisst mit etwas kaltem Wasser.');
    expect(eatsWith('indefinite')).toBe('der Kater frisst mit kaltem Wasser.');
  });

  test('German declines strong after viel / wenig, and for a feminine mass noun in the dative and genitive', () => {
    expect(eatsWith('many')).toBe('der Kater frisst mit viel kaltem Wasser.');
    expect(eatsWith('few')).toBe('der Kater frisst mit wenig kaltem Wasser.');
    expect(sayAll(clause(np('CAT'), 'EAT', { complements: { instrumental: { phrase: np('LIQUID', { definiteness: 'some', adjectives: ['COLD'] }) } } })).de)
      .toBe('der Kater frisst mit etwas kalter Flüssigkeit.');
    expect(sayAll(clause(np('CAT'), 'EAT', {
      complements: { instrumental: { phrase: np('LIQUID', { definiteness: 'indefinite', adjectives: ['COLD'] }), specifiers: [{ kind: 'abstraction', value: 'concept' }], action: { verb: 'DRINK' } } },
    })).de).toBe('der Kater frisst mit dem Trinken kalter Flüssigkeit.');
  });

  test('regression: a determiner that carries the case keeps the weak ending, and the nominative and accusative are unchanged', () => {
    expect(eatsWith('definite')).toBe('der Kater frisst mit dem kalten Wasser.');
    expect(eatsWith('no')).toBe('der Kater frisst mit keinem kalten Wasser.');
    expect(eatsWith('this')).toBe('der Kater frisst mit diesem kalten Wasser.');
    expect(eatsWith('all')).toBe('der Kater frisst mit all dem kalten Wasser.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('WATER', { definiteness: 'some', adjectives: ['COLD'] }) })).de).toBe('der Kater sieht etwas kaltes Wasser.');
    expect(sayAll(clause(np('WATER', { definiteness: 'indefinite', adjectives: ['COLD'] }), 'BURN')).de).toBe('kaltes Wasser brennt.');
  });
});

// A79. English chooses "a" or "an" by testing the next word's first LETTER for a vowel, so
// "universal", which starts with the consonant sound /j/, gets "an". The article follows the
// sound: "a universal cat", as in "a unit", "a European".
describe('known bugs: English a/an by spelling', () => {
  test('English writes "a" before a vowel letter that sounds as a consonant', () => {
    expect(say(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['UNIVERSAL'] }), 'RUN'), 'en')).toBe('a universal cat runs.');
    expect(say(clause(np('DOG'), 'SEE', { directObject: np('CAT', { definiteness: 'indefinite', adjectives: ['UNIVERSAL'] }) }), 'en')).toBe('the dog sees a universal cat.');
  });

  test('English follows the word right after the article, whichever it is', () => {
    const aCat = (adjectives: string[], extra: Partial<NounPhrase> = {}) =>
      say(clause(np('CAT', { definiteness: 'indefinite', adjectives, ...extra }), 'RUN'), 'en');
    expect(aCat(['UNIVERSAL', 'OLD'])).toBe('a universal old cat runs.');
    expect(aCat(['UNIVERSAL'], { adjectiveDegrees: ['less'] })).toBe('a less universal cat runs.');
  });

  test('regression: a vowel sound still takes "an", a consonant "a"', () => {
    const aCat = (adjective: string) => say(clause(np('CAT', { definiteness: 'indefinite', adjectives: [adjective] }), 'RUN'), 'en');
    expect(aCat('OLD')).toBe('an old cat runs.');
    expect(aCat('UNCONNECTED')).toBe('an unconnected cat runs.');
    expect(aCat('HIGH')).toBe('a high cat runs.');
  });
});

// A104. `ala` starts with a stressed a-, so it takes the masculine singular article ("el ala", "un
// ala"), like `agua`. The corpus does not mark WING with `stressed_a`, so `defArticle` and
// `indefArticle` give it the feminine form.
describe('known bugs: Spanish stressed-a noun WING', () => {
  test('Spanish gives "ala" the article "el" / "un"', () => {
    expect(sayAll(clause(np('WING'), 'BURN')).es).toBe('el ala arde.');
    expect(sayAll(clause(np('WING', { definiteness: 'indefinite' }), 'BURN')).es).toBe('un ala arde.');
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { locative: { phrase: np('WING') } } })).es)
      .toBe('el gato corre en el ala.');
    expect(sayAll(clause(np('BOOK', { possessor: np('WING') }), 'BURN')).es).toBe('el libro del ala arde.');
  });

  test('Spanish gives "ala" the masculine article after "a" / "de" and before a postnominal adjective and a predicate', () => {
    expect(sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: np('WING') } } })).es).toBe('el gato va al ala.');
    expect(sayAll(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('WING') } } })).es).toBe('el gato viene del ala.');
    expect(sayAll(clause(np('WING', { adjectives: ['BIG'] }), 'BURN')).es).toBe('el ala grande arde.');
    expect(sayAll(clause(np('WING'), 'BE', { complements: { predicative: { phrase: np('BIG') } } })).es).toBe('el ala es grande.');
  });

  test('regression: the plural, the demonstrative and a prenominal adjective keep the feminine', () => {
    expect(sayAll(clause(np('WING', { number: 'plural' }), 'BURN')).es).toBe('las alas arden.');
    expect(sayAll(clause(np('WING', { definiteness: 'this' }), 'BURN')).es).toBe('esta ala arde.');
    expect(sayAll(clause(np('WING', { adjectives: ['FIRST'] }), 'BURN')).es).toBe('la primera ala arde.');
  });
});

// ICE_CREAM, a countable food noun — unlike the mass FOOD it takes the indefinite article and
// pluralises in the serving sense ("an ice cream", "due gelati"). Feminine in French (glace) and
// neuter in German, where "Eis" is invariable in the plural ("die Eis", "viele Eis").
describe('a countable food noun: ICE_CREAM', () => {
  const eats = (iceCream: NounPhrase) => sayAll(clause(np('CAT'), 'EAT', { directObject: iceCream }));

  test('takes its gendered article, the indefinite, and pluralises', () => {
    expect(eats(np('ICE_CREAM'))).toEqual({
      en: 'the cat eats the ice cream.',
      it: 'il gatto mangia il gelato.',
      fr: 'le chat mange la glace.',
      de: 'der Kater frisst das Eis.',
      es: 'el gato come el helado.',
      ja: '猫はアイスクリームを食べます。',
      pt: 'o gato come o sorvete.',
    });
    expect(eats(np('ICE_CREAM', { number: 'plural' }))).toEqual({
      en: 'the cat eats the ice creams.',
      it: 'il gatto mangia i gelati.',
      fr: 'le chat mange les glaces.',
      de: 'der Kater frisst die Eis.', // invariable plural
      es: 'el gato come los helados.',
      ja: '猫はアイスクリームを食べます。',
      pt: 'o gato come os sorvetes.',
    });
    expect(eats(np('ICE_CREAM', { definiteness: 'indefinite' }))).toEqual({
      en: 'the cat eats an ice cream.',
      it: 'il gatto mangia un gelato.',
      fr: 'le chat mange une glace.',
      de: 'der Kater frisst ein Eis.',
      es: 'el gato come un helado.',
      ja: '猫はアイスクリームを食べます。',
      pt: 'o gato come um sorvete.',
    });
  });

  test('is countable: a quantifier takes the count word and the plural', () => {
    expect(eats(np('ICE_CREAM', { definiteness: 'many' }))).toEqual({
      en: 'the cat eats many ice creams.',
      it: 'il gatto mangia molti gelati.',
      fr: 'le chat mange beaucoup de glaces.',
      de: 'der Kater frisst viele Eis.',
      es: 'el gato come muchos helados.',
      ja: '猫は多くのアイスクリームを食べます。',
      pt: 'o gato come muitos sorvetes.',
    });
  });

  test('an adjective agrees with its gender', () => {
    expect(eats(np('ICE_CREAM', { definiteness: 'indefinite', adjectives: ['BIG'] }))).toEqual({
      en: 'the cat eats a big ice cream.',
      it: 'il gatto mangia un grande gelato.',
      fr: 'le chat mange une grande glace.', // feminine
      de: 'der Kater frisst ein großes Eis.', // neuter, mixed ending
      es: 'el gato come un helado grande.',
      ja: '猫は大きいアイスクリームを食べます。',
      pt: 'o gato come um sorvete grande.',
    });
  });

  test('the katakana アイスクリーム takes no furigana', () => {
    expect(furigana(clause(np('CAT'), 'EAT', { directObject: np('ICE_CREAM') })))
      .toEqual(['ねこ', 'たべます']);
  });
});

// The grammar nouns the period container, the verb's controls, the complement boxes and the noun
// modifier's chips are named with (localization B21–B24). Each one's indefinite singular and definite
// plural, which pin its article, its gender and its plural in every language. The tradition names are
// seeded as one noun each ("complemento di stato in luogo", "Dativobjekt"), so they decline as one.
describe('grammar nouns: clauses, complements, the verb’s features, modifier relations', () => {
  const said = (concept: string, extra: Partial<NounPhrase>) => sayAll({ subject: np(concept, extra) });

  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['CLAUSE',
      { en: 'a clause.', it: 'una proposizione.', fr: 'une proposition.', de: 'ein Satz.', es: 'una oración.', ja: '節。', pt: 'uma oração.' },
      { en: 'the clauses.', it: 'le proposizioni.', fr: 'les propositions.', de: 'die Sätze.', es: 'las oraciones.', ja: '節。', pt: 'as orações.' }],
    ['RELATIVE_CLAUSE',
      { en: 'a relative clause.', it: 'una proposizione relativa.', fr: 'une proposition relative.', de: 'ein Relativsatz.', es: 'una oración de relativo.', ja: '関係節。', pt: 'uma oração relativa.' },
      { en: 'the relative clauses.', it: 'le proposizioni relative.', fr: 'les propositions relatives.', de: 'die Relativsätze.', es: 'las oraciones de relativo.', ja: '関係節。', pt: 'as orações relativas.' }],
    ['CONDITION',
      { en: 'a condition.', it: 'una condizione.', fr: 'une condition.', de: 'eine Bedingung.', es: 'una condición.', ja: '条件。', pt: 'uma condição.' },
      { en: 'the conditions.', it: 'le condizioni.', fr: 'les conditions.', de: 'die Bedingungen.', es: 'las condiciones.', ja: '条件。', pt: 'as condições.' }],
    ['COORDINATION',
      { en: 'a coordination.', it: 'una coordinazione.', fr: 'une coordination.', de: 'eine Koordination.', es: 'una coordinación.', ja: '等位接続。', pt: 'uma coordenação.' },
      { en: 'the coordinations.', it: 'le coordinazioni.', fr: 'les coordinations.', de: 'die Koordinationen.', es: 'las coordinaciones.', ja: '等位接続。', pt: 'as coordenações.' }],
    ['CONJUNCT',
      { en: 'a conjunct.', it: 'un congiunto.', fr: 'un conjoint.', de: 'ein Konjunkt.', es: 'un miembro coordinado.', ja: '等位項。', pt: 'um membro coordenado.' },
      { en: 'the conjuncts.', it: 'i congiunti.', fr: 'les conjoints.', de: 'die Konjunkte.', es: 'los miembros coordinados.', ja: '等位項。', pt: 'os membros coordenados.' }],
    ['CONJUNCTION',
      { en: 'a conjunction.', it: 'una congiunzione.', fr: 'une conjonction.', de: 'eine Konjunktion.', es: 'una conjunción.', ja: '接続詞。', pt: 'uma conjunção.' },
      { en: 'the conjunctions.', it: 'le congiunzioni.', fr: 'les conjonctions.', de: 'die Konjunktionen.', es: 'las conjunciones.', ja: '接続詞。', pt: 'as conjunções.' }],
    ['MODIFIER',
      { en: 'a modifier.', it: 'un modificatore.', fr: 'un modificateur.', de: 'ein Modifikator.', es: 'un modificador.', ja: '修飾語。', pt: 'um modificador.' },
      { en: 'the modifiers.', it: 'i modificatori.', fr: 'les modificateurs.', de: 'die Modifikatoren.', es: 'los modificadores.', ja: '修飾語。', pt: 'os modificadores.' }],
    ['HYPERNYM',
      { en: 'a hypernym.', it: 'un iperonimo.', fr: 'un hyperonyme.', de: 'ein Hyperonym.', es: 'un hiperónimo.', ja: '上位語。', pt: 'um hiperónimo.' },
      { en: 'the hypernyms.', it: 'gli iperonimi.', fr: 'les hyperonymes.', de: 'die Hyperonyme.', es: 'los hiperónimos.', ja: '上位語。', pt: 'os hiperónimos.' }],
    ['VERB_PHRASE',
      { en: 'a verb phrase.', it: 'un sintagma verbale.', fr: 'un syntagme verbal.', de: 'eine Verbalphrase.', es: 'un sintagma verbal.', ja: '動詞句。', pt: 'um sintagma verbal.' },
      { en: 'the verb phrases.', it: 'i sintagmi verbali.', fr: 'les syntagmes verbaux.', de: 'die Verbalphrasen.', es: 'los sintagmas verbales.', ja: '動詞句。', pt: 'os sintagmas verbais.' }],
    ['COMPLEMENT_GRAMMAR',
      { en: 'a complement.', it: 'un complemento.', fr: 'un complément.', de: 'eine Ergänzung.', es: 'un complemento.', ja: '補語。', pt: 'um complemento.' },
      { en: 'the complements.', it: 'i complementi.', fr: 'les compléments.', de: 'die Ergänzungen.', es: 'los complementos.', ja: '補語。', pt: 'os complementos.' }],
    ['LOCATIVE',
      { en: 'a locative.', it: 'un complemento di stato in luogo.', fr: 'un complément circonstanciel de lieu.', de: 'eine adverbiale Bestimmung des Ortes.', es: 'un complemento circunstancial de lugar.', ja: '場所の副詞語句。', pt: 'um adjunto adverbial de lugar.' },
      { en: 'the locatives.', it: 'i complementi di stato in luogo.', fr: 'les compléments circonstanciels de lieu.', de: 'die adverbialen Bestimmungen des Ortes.', es: 'los complementos circunstanciales de lugar.', ja: '場所の副詞語句。', pt: 'os adjuntos adverbiais de lugar.' }],
    ['DIRECTION',
      { en: 'a direction.', it: 'un complemento di moto a luogo.', fr: 'un complément circonstanciel de direction.', de: 'eine adverbiale Bestimmung der Richtung.', es: 'un complemento circunstancial de dirección.', ja: '方向の副詞語句。', pt: 'um adjunto adverbial de direção.' },
      { en: 'the directions.', it: 'i complementi di moto a luogo.', fr: 'les compléments circonstanciels de direction.', de: 'die adverbialen Bestimmungen der Richtung.', es: 'los complementos circunstanciales de dirección.', ja: '方向の副詞語句。', pt: 'os adjuntos adverbiais de direção.' }],
    ['SOURCE',
      { en: 'a source.', it: 'un complemento di moto da luogo.', fr: 'un complément circonstanciel de provenance.', de: 'eine adverbiale Bestimmung der Herkunft.', es: 'un complemento circunstancial de procedencia.', ja: '起点の副詞語句。', pt: 'um adjunto adverbial de origem.' },
      { en: 'the sources.', it: 'i complementi di moto da luogo.', fr: 'les compléments circonstanciels de provenance.', de: 'die adverbialen Bestimmungen der Herkunft.', es: 'los complementos circunstanciales de procedencia.', ja: '起点の副詞語句。', pt: 'os adjuntos adverbiais de origem.' }],
    ['ROUTE',
      { en: 'a route.', it: 'un complemento di moto per luogo.', fr: 'un complément circonstanciel de passage.', de: 'eine adverbiale Bestimmung des Weges.', es: 'un complemento circunstancial de trayecto.', ja: '経路の副詞語句。', pt: 'um adjunto adverbial de percurso.' },
      { en: 'the routes.', it: 'i complementi di moto per luogo.', fr: 'les compléments circonstanciels de passage.', de: 'die adverbialen Bestimmungen des Weges.', es: 'los complementos circunstanciales de trayecto.', ja: '経路の副詞語句。', pt: 'os adjuntos adverbiais de percurso.' }],
    ['CAUSE_COMPLEMENT',
      { en: 'a cause.', it: 'un complemento di causa.', fr: 'un complément circonstanciel de cause.', de: 'eine adverbiale Bestimmung des Grundes.', es: 'un complemento circunstancial de causa.', ja: '原因の副詞語句。', pt: 'um adjunto adverbial de causa.' },
      { en: 'the causes.', it: 'i complementi di causa.', fr: 'les compléments circonstanciels de cause.', de: 'die adverbialen Bestimmungen des Grundes.', es: 'los complementos circunstanciales de causa.', ja: '原因の副詞語句。', pt: 'os adjuntos adverbiais de causa.' }],
    ['OBJECT_COMPLEMENT',
      { en: 'an object complement.', it: "un complemento predicativo dell'oggetto.", fr: "un attribut du complément d'objet.", de: 'ein Objektsprädikativ.', es: 'un complemento predicativo del objeto.', ja: '目的語補語。', pt: 'um predicativo do objeto.' },
      { en: 'the object complements.', it: "i complementi predicativi dell'oggetto.", fr: "les attributs du complément d'objet.", de: 'die Objektsprädikative.', es: 'los complementos predicativos del objeto.', ja: '目的語補語。', pt: 'os predicativos do objeto.' }],
    ['COMITATIVE',
      { en: 'a comitative.', it: 'un complemento di compagnia.', fr: "un complément d'accompagnement.", de: 'ein Komitativ.', es: 'un complemento circunstancial de compañía.', ja: '共同格。', pt: 'um adjunto adverbial de companhia.' },
      { en: 'the comitatives.', it: 'i complementi di compagnia.', fr: "les compléments d'accompagnement.", de: 'die Komitative.', es: 'los complementos circunstanciales de compañía.', ja: '共同格。', pt: 'os adjuntos adverbiais de companhia.' }],
    ['TERMINUS',
      { en: 'a terminus.', it: 'un complemento di termine.', fr: "un complément d'objet second.", de: 'ein Dativobjekt.', es: 'un complemento indirecto.', ja: '間接目的語。', pt: 'um objeto indireto.' },
      { en: 'the termini.', it: 'i complementi di termine.', fr: "les compléments d'objet second.", de: 'die Dativobjekte.', es: 'los complementos indirectos.', ja: '間接目的語。', pt: 'os objetos indiretos.' }],
    ['TENSE',
      { en: 'a tense.', it: 'un tempo.', fr: 'un temps.', de: 'ein Tempus.', es: 'un tiempo.', ja: '時制。', pt: 'um tempo.' },
      { en: 'the tenses.', it: 'i tempi.', fr: 'les temps.', de: 'die Tempora.', es: 'los tiempos.', ja: '時制。', pt: 'os tempos.' }],
    ['PRESENT_TENSE',
      { en: 'a present.', it: 'un presente.', fr: 'un présent.', de: 'ein Präsens.', es: 'un presente.', ja: '現在。', pt: 'um presente.' },
      { en: 'the presents.', it: 'i presenti.', fr: 'les présents.', de: 'die Präsentia.', es: 'los presentes.', ja: '現在。', pt: 'os presentes.' }],
    ['PAST_TENSE',
      { en: 'a past.', it: 'un passato.', fr: 'un passé.', de: 'ein Präteritum.', es: 'un pasado.', ja: '過去。', pt: 'um passado.' },
      { en: 'the pasts.', it: 'i passati.', fr: 'les passés.', de: 'die Präterita.', es: 'los pasados.', ja: '過去。', pt: 'os passados.' }],
    ['FUTURE_TENSE',
      { en: 'a future.', it: 'un futuro.', fr: 'un futur.', de: 'ein Futur.', es: 'un futuro.', ja: '未来。', pt: 'um futuro.' },
      { en: 'the futures.', it: 'i futuri.', fr: 'les futurs.', de: 'die Future.', es: 'los futuros.', ja: '未来。', pt: 'os futuros.' }],
    ['ASPECT',
      { en: 'an aspect.', it: 'un aspetto.', fr: 'un aspect.', de: 'ein Aspekt.', es: 'un aspecto.', ja: 'アスペクト。', pt: 'um aspecto.' },
      { en: 'the aspects.', it: 'gli aspetti.', fr: 'les aspects.', de: 'die Aspekte.', es: 'los aspectos.', ja: 'アスペクト。', pt: 'os aspectos.' }],
    ['POLARITY',
      { en: 'a polarity.', it: 'una polarità.', fr: 'une polarité.', de: 'eine Polarität.', es: 'una polaridad.', ja: '極性。', pt: 'uma polaridade.' },
      { en: 'the polarities.', it: 'le polarità.', fr: 'les polarités.', de: 'die Polaritäten.', es: 'las polaridades.', ja: '極性。', pt: 'as polaridades.' }],
    ['DEGREE_GRAMMAR',
      { en: 'a degree.', it: 'un grado.', fr: 'un degré.', de: 'eine Steigerungsstufe.', es: 'un grado.', ja: '程度。', pt: 'um grau.' },
      { en: 'the degrees.', it: 'i gradi.', fr: 'les degrés.', de: 'die Steigerungsstufen.', es: 'los grados.', ja: '程度。', pt: 'os graus.' }],
    ['MODAL',
      { en: 'a modal.', it: 'un verbo modale.', fr: 'un verbe modal.', de: 'ein Modalverb.', es: 'un verbo modal.', ja: '法助動詞。', pt: 'um verbo modal.' },
      { en: 'the modals.', it: 'i verbi modali.', fr: 'les verbes modaux.', de: 'die Modalverben.', es: 'los verbos modales.', ja: '法助動詞。', pt: 'os verbos modais.' }],
    ['FEATURE',
      { en: 'a feature.', it: 'una caratteristica.', fr: 'une caractéristique.', de: 'ein Merkmal.', es: 'una característica.', ja: '特徴。', pt: 'uma característica.' },
      { en: 'the features.', it: 'le caratteristiche.', fr: 'les caractéristiques.', de: 'die Merkmale.', es: 'las características.', ja: '特徴。', pt: 'as características.' }],
    ['MEANS',
      { en: 'a means.', it: 'un mezzo.', fr: 'un moyen.', de: 'ein Mittel.', es: 'un medio.', ja: '手段。', pt: 'um meio.' },
      { en: 'the means.', it: 'i mezzi.', fr: 'les moyens.', de: 'die Mittel.', es: 'los medios.', ja: '手段。', pt: 'os meios.' }],
    ['PURPOSE',
      { en: 'a purpose.', it: 'uno scopo.', fr: 'un but.', de: 'ein Zweck.', es: 'una finalidad.', ja: '目的。', pt: 'uma finalidade.' },
      { en: 'the purposes.', it: 'gli scopi.', fr: 'les buts.', de: 'die Zwecke.', es: 'las finalidades.', ja: '目的。', pt: 'as finalidades.' }],
    ['USE_NOUN',
      { en: 'a use.', it: 'un uso.', fr: 'un usage.', de: 'eine Verwendung.', es: 'un uso.', ja: '用途。', pt: 'um uso.' },
      { en: 'the uses.', it: 'gli usi.', fr: 'les usages.', de: 'die Verwendungen.', es: 'los usos.', ja: '用途。', pt: 'os usos.' }],
    ['MATERIAL',
      { en: 'a material.', it: 'un materiale.', fr: 'un matériau.', de: 'ein Material.', es: 'un material.', ja: '材料。', pt: 'um material.' },
      { en: 'the materials.', it: 'i materiali.', fr: 'les matériaux.', de: 'die Materialien.', es: 'los materiales.', ja: '材料。', pt: 'os materiais.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });
});

// A140. A German grammar term seeded as one noun keeps its attributive adjective inside its forms:
// "adverbiale Bestimmung des Ortes", plural "adverbiale Bestimmungen des Ortes". The adjective then
// never declines, which is right only where its ending happens to be -e: the nominative and accusative
// singular, and the plural with no article. After an article in the plural, and in the dative and
// genitive, it takes -en. The complement names LOCATIVE, DIRECTION, SOURCE, ROUTE, CAUSE_COMPLEMENT
// and ADVERBIAL_OF_MANNER all have this shape.
describe('known bugs: the adjective inside a German multiword noun', () => {
  test('declines with the article in the plural', () => {
    expect(say({ subject: np('LOCATIVE', { number: 'plural' }) }, 'de')).toBe('die adverbialen Bestimmungen des Ortes.');
    expect(say({ subject: np('ADVERBIAL_OF_MANNER', { number: 'plural' }) }, 'de'))
      .toBe('die adverbialen Bestimmungen der Art und Weise.');
  });

  test('declines in the dative', () => {
    expect(say(clause(np('CAT'), 'START', { complements: { instrumental: { phrase: np('LOCATIVE') } } }), 'de'))
      .toBe('der Kater beginnt mit der adverbialen Bestimmung des Ortes.');
  });

  // The dative plural -n goes on the head, not on the fixed genitive ("der Richtung", "der Art und Weise").
  test('declines in the dative plural and after a possessor\'s von', () => {
    expect(say(clause(np('CAT'), 'START', { complements: { instrumental: { phrase: np('DIRECTION', { number: 'plural' }) } } }), 'de'))
      .toBe('der Kater beginnt mit den adverbialen Bestimmungen der Richtung.');
    expect(say(clause(np('CAT'), 'START', { complements: { instrumental: { phrase: np('ADVERBIAL_OF_MANNER', { number: 'plural' }) } } }), 'de'))
      .toBe('der Kater beginnt mit den adverbialen Bestimmungen der Art und Weise.');
    expect(say({ subject: np('BOOK', { possessor: np('SOURCE', { number: 'plural' }) }) }, 'de'))
      .toBe('das Buch von den adverbialen Bestimmungen der Herkunft.');
  });

  test('declines in the accusative plural, after its own adjective', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('ROUTE', { number: 'plural' }) }), 'de'))
      .toBe('der Kater sieht die adverbialen Bestimmungen des Weges.');
    expect(say({ subject: np('LOCATIVE', { number: 'plural', adjectives: ['BIG'] }) }, 'de'))
      .toBe('die großen adverbialen Bestimmungen des Ortes.');
  });

  test('regression: the nominative singular and the bare plural already read right', () => {
    expect(say({ subject: np('LOCATIVE', { definiteness: 'this' }) }, 'de')).toBe('diese adverbiale Bestimmung des Ortes.');
    expect(say({ subject: np('CAUSE_COMPLEMENT', { definiteness: 'no' }) }, 'de')).toBe('keine adverbiale Bestimmung des Grundes.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('SOURCE', { definiteness: 'indefinite' }) }), 'de'))
      .toBe('der Kater sieht eine adverbiale Bestimmung der Herkunft.');
    expect(say({ subject: np('LOCATIVE', { number: 'plural', definiteness: 'many' }) }, 'de')).toBe('viele adverbiale Bestimmungen des Ortes.');
    expect(say({ subject: np('LOCATIVE', { number: 'plural', definiteness: 'bare' }) }, 'de'))
      .toBe('adverbiale Bestimmungen des Ortes.');
  });
});
