import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// P09-E5: the standard of comparison — what a predicate adjective's degree compares it *to*. The
// word is the degree's, not a constant: than / di / que / als / que / do que / より for the
// comparatives, and for the equative a circumfix whose first half replaces the degree adverb itself
// (as … as, tanto … quanto, aussi … que, so … wie, tan … como, tão … como, と同じくらい). Japanese puts the
// standard before the adjective, in the adverb's place, and lowers a degree by negating it (犬ほど
// 大きくない). `headStandard` is the predicate adjective's (E5's D2); an attributive adjective's is
// `adjectiveStandards` (P09-E18, at the end). On a superlative the predicate's field is the set it
// selects from (P09-E19, below), never a *than* (E5's D3).

/** "the cat is <adjective at degree> [than <standard>]", with `extra` merged onto the clause. */
const cat = (degree: Degree, standard?: NounElement, adjective = 'BIG', extra: Partial<PhrasePlan> = {}): PhrasePlan =>
  clause(np('CAT'), 'BE', {
    ...extra,
    complements: { predicative: { phrase: np(adjective, { headDegree: degree, ...(standard ? { headStandard: standard } : {}) }) } },
  });
const DOG = np('DOG');
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, extra);

describe('the standard of comparison: the three rows', () => {
  test('bigger than the dog', () => {
    expect(sayAll(cat('more', DOG))).toEqual({
      en: 'the cat is bigger than the dog.',
      it: 'il gatto è più grande del cane.',
      fr: 'le chat est plus grand que le chien.',
      de: 'der Kater ist größer als der Hund.',
      es: 'el gato es más grande que el perro.',
      // The synthetic comparative the engine already makes for grande, with the fixed "do que" (D4).
      pt: 'o gato é maior do que o cão.',
      // The standard stands before the adjective, in もっと's place.
      ja: '猫は犬より大きいです。',
    });
  });

  test('as big as the dog', () => {
    expect(sayAll(cat('equally', DOG))).toEqual({
      en: 'the cat is as big as the dog.',
      it: 'il gatto è tanto grande quanto il cane.',
      fr: 'le chat est aussi grand que le chien.',
      de: 'der Kater ist so groß wie der Hund.',
      es: 'el gato es tan grande como el perro.',
      pt: 'o gato é tão grande como o cão.',
      ja: '猫は犬と同じくらい大きいです。',
    });
  });

  test('less big than the dog', () => {
    expect(sayAll(cat('less', DOG))).toEqual({
      en: 'the cat is less big than the dog.',
      it: 'il gatto è meno grande del cane.',
      fr: 'le chat est moins grand que le chien.',
      de: 'der Kater ist weniger groß als der Hund.',
      es: 'el gato es menos grande que el perro.',
      pt: 'o gato é menos grande do que o cão.',
      // Negative polarity: ほど + the negated adjective, the それほど of the bare degree made specific.
      ja: '猫は犬ほど大きくないです。',
    });
  });
});

describe('the equative adverb depends on the standard (D1)', () => {
  // "equally big" and "as big as the dog" do not share a word in it/de/es/pt — nor in English,
  // whose "equally" becomes "as". French's "aussi" already is the circumfix's first half.
  test('a bare equative renders exactly as it did', () => {
    expect(sayAll(cat('equally'))).toEqual({
      en: 'the cat is equally big.',
      it: 'il gatto è ugualmente grande.',
      fr: 'le chat est aussi grand.',
      de: 'der Kater ist gleich groß.',
      es: 'el gato es igual de grande.',
      pt: 'o gato é igualmente grande.',
      ja: '猫は同じくらい大きいです。',
    });
  });

  test('the adverb swaps in en/it/de/es/pt and stays in fr', () => {
    const bare = sayAll(cat('equally'));
    const withStandard = sayAll(cat('equally', DOG));
    for (const lang of ['en', 'it', 'de', 'es', 'pt'] as const) {
      expect(withStandard[lang].startsWith(bare[lang].replace(/\.$/, '')), lang).toBe(false);
    }
    expect(withStandard.fr.startsWith('le chat est aussi grand')).toBe(true);
  });

  test('a comparative with no standard renders exactly as it did', () => {
    expect(sayAll(cat('more'))).toEqual({
      en: 'the cat is bigger.', it: 'il gatto è più grande.', fr: 'le chat est plus grand.',
      de: 'der Kater ist größer.', es: 'el gato es más grande.', pt: 'o gato é maior.',
      ja: '猫はもっと大きいです。',
    });
    expect(say(cat('less'), 'ja')).toBe('猫はそれほど大きくないです。');
  });
});

describe('kinds of standard', () => {
  test('an indefinite standard keeps its article — and French elides before it', () => {
    expect(sayAll(cat('more', the('DOG', { definiteness: 'indefinite' })))).toEqual({
      en: 'the cat is bigger than a dog.',
      it: 'il gatto è più grande di un cane.',
      fr: "le chat est plus grand qu'un chien.",
      de: 'der Kater ist größer als ein Hund.',
      es: 'el gato es más grande que un perro.',
      pt: 'o gato é maior do que um cão.',
      ja: '猫は犬より大きいです。',
    });
  });

  test('a pronoun standard: object form in en, tonic in it/fr, subject form in de/es/pt', () => {
    expect(sayAll(cat('more', np('THIRD_PERSON')))).toEqual({
      en: 'the cat is bigger than him.',
      it: 'il gatto è più grande di lui.',
      fr: 'le chat est plus grand que lui.',
      de: 'der Kater ist größer als er.',
      es: 'el gato es más grande que él.',
      pt: 'o gato é maior do que ele.',
      ja: '猫は彼より大きいです。',
    });
    // The first person is where the three choices differ on the page: "than me", "di me", "que moi",
    // but "als ich", "que yo", "do que eu" — never the dative "mir" or the tonic "mí" / "mim".
    expect(sayAll(cat('equally', np('FIRST_PERSON')))).toEqual({
      en: 'the cat is as big as me.',
      it: 'il gatto è tanto grande quanto me.',
      fr: 'le chat est aussi grand que moi.',
      de: 'der Kater ist so groß wie ich.',
      es: 'el gato es tan grande como yo.',
      pt: 'o gato é tão grande como eu.',
      ja: '猫は私と同じくらい大きいです。',
    });
  });

  test('a coordinated standard: Italian repeats its fused "di", the rest say the word once', () => {
    expect(sayAll(cat('more', { conjuncts: [np('DOG'), np('MAN')], conjunction: 'and' }))).toEqual({
      en: 'the cat is bigger than the dog and the man.',
      it: "il gatto è più grande del cane e dell'uomo.",
      fr: "le chat est plus grand que le chien et l'homme.",
      de: 'der Kater ist größer als der Hund und der Mann.',
      es: 'el gato es más grande que el perro y el hombre.',
      pt: 'o gato é maior do que o cão e o homem.',
      ja: '猫は犬と男より大きいです。',
    });
  });
});

describe('Italian "di" fuses with the article; Portuguese "do que" is fixed (D4)', () => {
  test('del, dello, dell\', della, dei', () => {
    expect(say(cat('more', np('DOG')), 'it')).toBe('il gatto è più grande del cane.');
    expect(say(cat('more', np('UNCLE')), 'it')).toBe('il gatto è più grande dello zio.');
    expect(say(cat('more', np('MAN')), 'it')).toBe("il gatto è più grande dell'uomo.");
    expect(say(cat('more', np('CAT', { gender: 'fem' })), 'it')).toBe('il gatto è più grande della gatta.');
    expect(say(cat('more', np('DOG', { number: 'plural' })), 'it')).toBe('il gatto è più grande dei cani.');
  });

  test('"do que" never agrees: the standard keeps its own article', () => {
    expect(say(cat('more', np('CAT', { gender: 'fem' })), 'pt')).toBe('o gato é maior do que a gata.');
    expect(say(cat('less', np('DOG', { number: 'plural' })), 'pt')).toBe('o gato é menos grande do que os cães.');
  });
});

describe('Japanese: the standard before the adjective, ほど with the negative', () => {
  test('the standard takes the adverb\'s place and leads the intensifier', () => {
    const plan = clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headIntensifier: 'VERY', headStandard: DOG }) } },
    });
    // VERY on a comparative is ずっと, the standard leading it (A248).
    expect(say(plan, 'ja')).toBe('猫は犬よりずっと大きいです。');
  });

  test('ほど negates every class of adjective', () => {
    expect(say(cat('less', DOG, 'HAPPY'), 'ja')).toBe('猫は犬ほど幸せではないです。');
    expect(say(cat('less', DOG, 'TIRED'), 'ja')).toBe('猫は犬ほど疲れていないです。');
  });

  test('the clause keeps its politeness and tense, and a relative clause its plain form', () => {
    expect(say(cat('more', DOG, 'BIG', { verbPhrase: { tense: 'past' } } as Partial<PhrasePlan>), 'ja')).toBe('猫は犬より大きかったです。');
    const relative = clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG }) } } },
    } as Partial<NounPhrase>), 'RUN');
    expect(say(relative, 'ja')).toBe('犬より大きい猫は走ります。');
  });

  test('a non-copular predicate places it the same way', () => {
    expect(say(clause(np('CAT'), 'BECOME', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG }) } },
    }), 'ja')).toBe('猫は犬より大きくなります。');
  });
});

describe('the standard beside the rest of the clause', () => {
  test('negation', () => {
    expect(sayAll(cat('more', DOG, 'BIG', { verbPhrase: { verb: 'BE', negative: true } } as Partial<PhrasePlan>))).toEqual({
      en: 'the cat is not bigger than the dog.',
      it: 'il gatto non è più grande del cane.',
      fr: "le chat n'est pas plus grand que le chien.",
      de: 'der Kater ist nicht größer als der Hund.',
      es: 'el gato no es más grande que el perro.',
      pt: 'o gato não é maior do que o cão.',
      ja: '猫は犬より大きくないです。',
    });
  });

  test('a suppletive comparative and a transient adjective', () => {
    expect(sayAll(cat('more', DOG, 'GOOD'))).toMatchObject({
      en: 'the cat is better than the dog.', fr: 'le chat est meilleur que le chien.',
      de: 'der Kater ist besser als der Hund.', pt: 'o gato é melhor do que o cão.',
    });
    // Spanish and Portuguese keep estar for a transient adjective, standard or not.
    expect(sayAll(cat('more', DOG, 'HAPPY'))).toMatchObject({
      es: 'el gato está más feliz que el perro.', pt: 'o gato está mais feliz do que o cão.',
    });
  });

  test('a relative clause', () => {
    const relative = clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG }) } } },
    } as Partial<NounPhrase>), 'RUN');
    expect(sayAll(relative)).toMatchObject({
      en: 'the cat that is bigger than the dog runs.',
      it: 'il gatto che è più grande del cane corre.',
      de: 'der Kater, der größer als der Hund ist, läuft.',
    });
  });
});

// P09-E19: on a superlative `headStandard` is the set the adjective selects from — the partitive E5's
// D3 kept apart from *than*. English says "of" before a plural set and "in" before a singular one,
// French "d'entre" before a pronoun; English and German add the article the set forces ("is the
// biggest of", "ist das größte der"), and German's agrees with the set's noun where it names one.
describe('the superlative set (P09-E19)', () => {
  const ANIMALS = np('ANIMAL', { number: 'plural' });
  const DOGS = np('DOG', { number: 'plural' });
  const woman = (degree: Degree, set?: NounElement): PhrasePlan => clause(np('WOMAN'), 'BE', {
    complements: { predicative: { phrase: np('BEAUTIFUL', { headDegree: degree, ...(set ? { headStandard: set } : {}) }) } },
  });

  test('the biggest of the animals', () => {
    expect(sayAll(cat('most', ANIMALS))).toEqual({
      en: 'the cat is the biggest of the animals.',
      it: 'il gatto è il più grande degli animali.',
      fr: 'le chat est le plus grand des animaux.',
      // The article agrees with the understood noun, the set's Tier (neuter), not with Kater (D4).
      de: 'der Kater ist das größte der Tiere.',
      es: 'el gato es el más grande de los animales.',
      pt: 'o gato é o maior dos animais.',
      // の中で, and 最も stays, unlike the adverb a standard replaces.
      ja: '猫は動物の中で最も大きいです。',
    });
  });

  test('the most beautiful in the family', () => {
    expect(sayAll(woman('most', np('FAMILY')))).toEqual({
      // A singular set takes "in".
      en: 'the woman is the most beautiful in the family.',
      it: 'la donna è la più bella della famiglia.',
      fr: 'la femme est la plus belle de la famille.',
      // A singular collective names no understood noun: the subject's gender.
      de: 'die Frau ist die schönste der Familie.',
      es: 'la mujer es la más hermosa de la familia.',
      pt: 'a mulher é a mais bela da família.',
      ja: '女は家族の中で最も美しいです。',
    });
  });

  test('the biggest of us', () => {
    expect(sayAll(cat('most', np('FIRST_PERSON', { number: 'plural' })))).toEqual({
      en: 'the cat is the biggest of us.',
      it: 'il gatto è il più grande di noi.',
      // Never "*de nous".
      fr: "le chat est le plus grand d'entre nous.",
      // "von" + the dative, and the subject's gender.
      de: 'der Kater ist der größte von uns.',
      // The tonic form a preposition governs, not E5's subject form after "que".
      es: 'el gato es el más grande de nosotros.',
      pt: 'o gato é o maior de nós.',
      ja: '猫は私たちの中で最も大きいです。',
    });
  });

  test('least, which Japanese keeps negated', () => {
    expect(sayAll(cat('least', ANIMALS))).toEqual({
      en: 'the cat is the least big of the animals.',
      it: 'il gatto è il meno grande degli animali.',
      fr: 'le chat est le moins grand des animaux.',
      de: 'der Kater ist das am wenigsten große der Tiere.',
      es: 'el gato es el menos grande de los animales.',
      pt: 'o gato é o menos grande dos animais.',
      ja: '猫は動物の中で最も大きくないです。',
    });
  });

  test('a coordinated set: the Romance preposition fuses per conjunct', () => {
    expect(sayAll(cat('most', { conjuncts: [ANIMALS, np('MAN', { number: 'plural' })], conjunction: 'and' }))).toEqual({
      en: 'the cat is the biggest of the animals and the men.',
      it: 'il gatto è il più grande degli animali e degli uomini.',
      fr: 'le chat est le plus grand des animaux et des hommes.',
      // No one understood noun: the subject's gender.
      de: 'der Kater ist der größte der Tiere und der Männer.',
      es: 'el gato es el más grande de los animales y de los hombres.',
      pt: 'o gato é o maior dos animais e dos homens.',
      ja: '猫は動物と男の中で最も大きいです。',
    });
  });

  test('English "of" against "in" goes by the set\'s number', () => {
    expect(say(cat('most', DOGS), 'en')).toBe('the cat is the biggest of the dogs.');
    expect(say(cat('most', np('FAMILY')), 'en')).toBe('the cat is the biggest in the family.');
    expect(say(cat('most', np('FAMILY', { number: 'plural' })), 'en')).toBe('the cat is the biggest of the families.');
  });

  test('French "d\'entre" is for a pronoun only', () => {
    expect(say(cat('most', DOGS), 'fr')).toBe('le chat est le plus grand des chiens.');
    expect(say(cat('most', np('THIRD_PERSON', { number: 'plural' })), 'fr')).toBe("le chat est le plus grand d'entre eux.");
  });

  test('German: the set\'s gender, else the subject\'s; the number is the subject\'s; lower-case', () => {
    expect(say(cat('most', ANIMALS), 'de')).toBe('der Kater ist das größte der Tiere.');
    expect(say(cat('most', DOGS), 'de')).toBe('der Kater ist der größte der Hunde.');
    expect(say(woman('most', np('FAMILY')), 'de')).toBe('die Frau ist die schönste der Familie.');
    expect(say(cat('most', np('FIRST_PERSON', { number: 'plural' })), 'de')).toBe('der Kater ist der größte von uns.');
    expect(say(clause(np('CAT', { number: 'plural' }), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headStandard: ANIMALS }) } },
    }), 'de')).toBe('die Kater sind die größten der Tiere.');
  });

  // E5's "most + a standard renders the plain superlative", rewritten: the bare superlative is what
  // stays exactly as it was, and a standard on `most` is now its set.
  test('the bare superlative is unchanged in all seven', () => {
    expect(sayAll(cat('most'))).toEqual({
      en: 'the cat is biggest.',
      it: 'il gatto è il più grande.',
      fr: 'le chat est le plus grand.',
      de: 'der Kater ist am größten.',
      es: 'el gato es el más grande.',
      pt: 'o gato é o maior.',
      ja: '猫は最も大きいです。',
    });
    expect(sayAll(cat('least'))).toEqual({
      en: 'the cat is least big.',
      it: 'il gatto è il meno grande.',
      fr: 'le chat est le moins grand.',
      de: 'der Kater ist am wenigsten groß.',
      es: 'el gato es el menos grande.',
      pt: 'o gato é o menos grande.',
      ja: '猫は最も大きくないです。',
    });
  });

  test('a set is no standard: no "than", and no equative circumfix', () => {
    for (const text of Object.values(sayAll(cat('most', DOGS)))) {
      expect(text).not.toMatch(/\b(than|que|als|wie|como|tanto|quanto|tan|tão|so)\b|より/);
    }
  });

  test('positive still drops a standard', () => {
    expect(sayAll(cat('positive', DOG))).toEqual(sayAll(cat('positive')));
  });

  test('the superlative\'s own intensifier leads the article', () => {
    const plan = clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headIntensifier: 'VERY', headStandard: ANIMALS }) } },
    });
    expect(sayAll(plan)).toMatchObject({
      en: 'the cat is by far the biggest of the animals.',
      it: 'il gatto è di gran lunga il più grande degli animali.',
      de: 'der Kater ist bei weitem das größte der Tiere.',
    });
  });
});

// A249. Japanese renders a lowered degree as a negated predicate — それほど大きくない, 犬ほど大きくない —
// and a negated clause then negates that predicate again: 猫はそれほど大きくなくないです. The stacked
// 〜なくない is colloquial litotes at best, and nothing a polite sentence says. "Not less big" denies
// the proposition the lowered degree already states, so the negation belongs over the whole of it,
// which Japanese says with わけではない in the polite form the engine gives a negated noun predicate
// (犬ではありません): 猫はそれほど大きくないわけではありません. The six European languages read
// "not less big" as a plain negation and are right.
describe('known bugs: Japanese negates a lowered degree twice (A249)', () => {
  const notLess = (standard?: NounElement, tense?: 'past') =>
    cat('less', standard, 'BIG', { verbPhrase: { verb: 'BE', negative: true, ...(tense ? { tense } : {}) } } as Partial<PhrasePlan>);

  test('without a standard: それほど大きくないわけではありません', () => {
    expect(say(notLess(), 'ja')).toBe('猫はそれほど大きくないわけではありません。');
  });

  test('with a standard: 犬ほど大きくないわけではありません', () => {
    expect(say(notLess(DOG), 'ja')).toBe('猫は犬ほど大きくないわけではありません。');
  });

  test('in the past: それほど大きくないわけではありませんでした', () => {
    expect(say(notLess(undefined, 'past'), 'ja')).toBe('猫はそれほど大きくないわけではありませんでした。');
  });

  test('in the past with a standard: 犬ほど大きくないわけではありませんでした', () => {
    expect(say(notLess(DOG, 'past'), 'ja')).toBe('猫は犬ほど大きくないわけではありませんでした。');
  });

  // A relative clause closes on the plain わけではない, before its head noun; the past on わけではなかった.
  const catWhoIsNotLess = (standard?: NounElement, tense?: 'past') =>
    clause(np('CAT', {
      relative: {
        verbPhrase: { verb: 'BE', negative: true, ...(tense ? { tense } : {}) },
        complements: { predicative: { phrase: np('BIG', { headDegree: 'less', ...(standard ? { headStandard: standard } : {}) }) } },
      },
    }), 'RUN');

  test('in a relative clause: 犬ほど大きくないわけではない猫', () => {
    expect(say(catWhoIsNotLess(DOG), 'ja')).toBe('犬ほど大きくないわけではない猫は走ります。');
  });

  test('in a past relative clause: それほど大きくないわけではなかった猫', () => {
    expect(say(catWhoIsNotLess(undefined, 'past'), 'ja')).toBe('それほど大きくないわけではなかった猫は走ります。');
  });

  test('the other adjective classes keep their own lowered predicate under わけ', () => {
    expect(say(cat('less', undefined, 'HAPPY', { verbPhrase: { verb: 'BE', negative: true } } as Partial<PhrasePlan>), 'ja'))
      .toBe('猫はそれほど幸せではないわけではありません。');
    expect(say(cat('less', undefined, 'TIRED', { verbPhrase: { verb: 'BE', negative: true } } as Partial<PhrasePlan>), 'ja'))
      .toBe('猫はそれほど疲れていないわけではありません。');
  });

  test('regression: a negated plain or raised degree negates the adjective once, as before', () => {
    const negated = (degree?: Degree, standard?: NounElement) =>
      clause(np('CAT'), 'BE', {
        verbPhrase: { negative: true },
        complements: { predicative: { phrase: np('BIG', { ...(degree ? { headDegree: degree } : {}), ...(standard ? { headStandard: standard } : {}) }) } },
      });
    expect(say(negated(), 'ja')).toBe('猫は大きくないです。');
    expect(say(negated('more'), 'ja')).toBe('猫はもっと大きくないです。');
    expect(say(negated('more', DOG), 'ja')).toBe('猫は犬より大きくないです。');
    expect(say(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('BIG', { headDegree: 'less', headStandard: DOG }) } } },
    }), 'RUN'), 'ja')).toBe('犬ほど大きくない猫は走ります。');
  });

  test('regression: the affirmative lowered degree, and the European negation, are right', () => {
    expect(say(cat('less'), 'ja')).toBe('猫はそれほど大きくないです。');
    expect(say(cat('less', DOG), 'ja')).toBe('猫は犬ほど大きくないです。');
    expect(sayAll(notLess(DOG))).toMatchObject({
      en: 'the cat is not less big than the dog.', it: 'il gatto non è meno grande del cane.',
      fr: "le chat n'est pas moins grand que le chien.", de: 'der Kater ist nicht weniger groß als der Hund.',
      es: 'el gato no es menos grande que el perro.', pt: 'o gato não é menos grande do que o cão.',
    });
  });
});

// P09-E18: the standard of an attributive adjective, `adjectiveStandards`, index-aligned with the
// adjectives. The words are E5's; what is new is where each language puts them inside the noun
// phrase — after the noun in English (the equative adjective with it) and German, right after the
// compared adjective in Romance, before it in Japanese.
describe('attributive (P09-E18)', () => {
  const compared = (concept: string, degree: Degree, standard: NounElement = DOG, extra: Partial<NounPhrase> = {}): NounPhrase =>
    np(concept, { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: [degree], adjectiveStandards: [standard], ...extra });
  const sees = (object: NounPhrase): PhrasePlan => clause(np('MAN'), 'SEE', { directObject: object });

  test('the man sees a bigger cat than the dog', () => {
    expect(sayAll(sees(compared('CAT', 'more')))).toEqual({
      en: 'the man sees a bigger cat than the dog.',
      it: "l'uomo vede un gatto più grande del cane.",
      fr: "l'homme voit un chat plus grand que le chien.",
      // The standard in the object's accusative.
      de: 'der Mann sieht einen größeren Kater als den Hund.',
      es: 'el hombre ve un gato más grande que el perro.',
      pt: 'o homem vê um gato maior do que o cão.',
      ja: '男は犬より大きい猫を見ます。',
    });
  });

  test('the cat is a bigger animal than the dog', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: compared('ANIMAL', 'more') } } }))).toEqual({
      en: 'the cat is a bigger animal than the dog.',
      it: 'il gatto è un animale più grande del cane.',
      fr: 'le chat est un animal plus grand que le chien.',
      // A predicate noun is nominative, and so is its standard.
      de: 'der Kater ist ein größeres Tier als der Hund.',
      es: 'el gato es un animal más grande que el perro.',
      pt: 'o gato é um animal maior do que o cão.',
      ja: '猫は犬より大きい動物です。',
    });
  });

  test('a cat as big as the dog eats', () => {
    expect(sayAll(clause(compared('CAT', 'equally'), 'EAT'))).toEqual({
      // "*an as big cat as the dog": the equative moves behind the noun with its standard.
      en: 'a cat as big as the dog eats.',
      it: 'un gatto tanto grande quanto il cane mangia.',
      fr: 'un chat aussi grand que le chien mange.',
      de: 'ein so großer Kater wie der Hund frisst.',
      es: 'un gato tan grande como el perro come.',
      pt: 'um gato tão grande como o cão come.',
      ja: '犬と同じくらい大きい猫は食べます。',
    });
  });

  test('less, and Japanese\'s negated ほど', () => {
    expect(sayAll(sees(compared('CAT', 'less')))).toEqual({
      en: 'the man sees a less big cat than the dog.',
      it: "l'uomo vede un gatto meno grande del cane.",
      fr: "l'homme voit un chat moins grand que le chien.",
      de: 'der Mann sieht einen weniger großen Kater als den Hund.',
      es: 'el hombre ve un gato menos grande que el perro.',
      pt: 'o homem vê um gato menos grande do que o cão.',
      ja: '男は犬ほど大きくない猫を見ます。',
    });
  });

  test('German: the standard takes the case of the phrase it compares with', () => {
    expect(say(sees(compared('CAT', 'more')), 'de')).toBe('der Mann sieht einen größeren Kater als den Hund.');
    expect(say(clause(compared('CAT', 'more'), 'EAT'), 'de')).toBe('ein größerer Kater als der Hund frisst.');
    expect(say(clause(np('MAN'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: compared('CAT', 'more') } },
    }), 'de')).toBe('der Mann gibt einem größeren Kater als dem Hund das Buch.');
    // A pronoun standard declines too: "als mich", parallel to the object.
    expect(say(sees(compared('CAT', 'more', np('FIRST_PERSON'))), 'de')).toBe('der Mann sieht einen größeren Kater als mich.');
  });

  test('English: the comparative stays before the noun, and the standard precedes a relative clause', () => {
    expect(say(sees(compared('CAT', 'more', DOG, { relative: { verbPhrase: { verb: 'RUN' } } })), 'en'))
      .toBe('the man sees a bigger cat than the dog that runs.');
    // A possessor with a standard is post-modified: the of-genitive, never "*a bigger cat than the dog's book".
    expect(say(clause(np('BOOK', { possessor: compared('CAT', 'more') }), 'EAT'), 'en')).toMatch(/^the book of a bigger cat than the dog /);
  });

  test('Romance: the compared adjective moves last among the postnominal ones, its standard after it (D3)', () => {
    const brownFirst = sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BROWN', 'BIG'], adjectiveDegrees: ['positive', 'more'], adjectiveStandards: [undefined, DOG],
    }));
    const bigFirst = sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG', 'BROWN'], adjectiveDegrees: ['more', 'positive'], adjectiveStandards: [DOG],
    }));
    for (const plan of [brownFirst, bigFirst]) {
      expect(sayAll(plan)).toMatchObject({
        it: "l'uomo vede un gatto marrone e più grande del cane.",
        fr: "l'homme voit un chat brun et plus grand que le chien.",
        es: 'el hombre ve un gato marrón y más grande que el perro.',
        pt: 'o homem vê um gato castanho e maior do que o cão.',
      });
    }
    // Japanese leads with it, so the standard's noun takes no modifier before it (茶色の犬 would be
    // "the brown dog").
    expect(say(brownFirst, 'ja')).toBe('男は犬より大きい茶色の猫を見ます。');
    expect(say(bigFirst, 'ja')).toBe('男は犬より大きい茶色の猫を見ます。');
  });

  // Italian puts it ahead of the compared adjective instead (A271), where it cannot read as the
  // standard's possessor; the other Romance languages keep it after the standard.
  test('a genitive possessor keeps its place after the standard, but for Italian (A271)', () => {
    expect(sayAll(sees(compared('CAT', 'more', DOG, { possessor: np('WOMAN') })))).toMatchObject({
      it: "l'uomo vede un gatto della donna più grande del cane.",
      fr: "l'homme voit un chat plus grand que le chien de la femme.",
      es: 'el hombre ve un gato más grande que el perro de la mujer.',
      pt: 'o homem vê um gato maior do que o cão da mulher.',
      // German puts it after the possessor: "*als den Hund der Frau" would be the woman's dog.
      de: 'der Mann sieht einen größeren Kater der Frau als den Hund.',
    });
  });

  test('at most one renders: the first compared adjective with a standard (D1)', () => {
    const two = sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG', 'BEAUTIFUL'], adjectiveDegrees: ['more', 'more'], adjectiveStandards: [DOG, np('FOX')],
    }));
    for (const text of Object.values(sayAll(two))) expect(text).not.toMatch(/fox|volpe|renard|Fuchs|zorro|raposa|キツネ/);
    expect(say(two, 'en')).toBe('the man sees a bigger more beautiful cat than the dog.');
  });

  test('a standard on a positive or a superlative adjective is dropped', () => {
    const plain = (degree: Degree) => sees(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: [degree] }));
    expect(sayAll(sees(compared('CAT', 'positive')))).toEqual(sayAll(plain('positive')));
    expect(sayAll(sees(compared('CAT', 'most')))).toEqual(sayAll(plain('most')));
  });

  test('Japanese: a second plain adjective after the compared one', () => {
    expect(say(sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG', 'OLD'], adjectiveDegrees: ['more', 'positive'], adjectiveStandards: [DOG],
    })), 'ja')).toBe('男は犬より大きい古い猫を見ます。');
  });

  test('the head\'s standard and an adjective\'s are independent', () => {
    expect(sayAll(cat('more', DOG))).toEqual(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG, adjectiveStandards: [np('FOX')] }) } },
    })));
  });
});
