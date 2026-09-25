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
    expect(sayAll(plan)).toEqual({
      en: 'the cat is by far the biggest of the animals.',
      it: 'il gatto è di gran lunga il più grande degli animali.',
      fr: 'le chat est de loin le plus grand des animaux.',
      de: 'der Kater ist bei weitem das größte der Tiere.',
      es: 'el gato es con mucho el más grande de los animales.',
      pt: 'o gato é de longe o maior dos animais.',
      // 断然 leads 最も, after the set.
      ja: '猫は動物の中で断然最も大きいです。',
    });
  });

  /** "<subject> <verb> the <adjective>-est of <set>". */
  const most = (subject: NounPhrase, adjective: string, set: NounElement, verb = 'BE'): PhrasePlan => clause(subject, verb, {
    complements: { predicative: { phrase: np(adjective, { headDegree: 'most', headStandard: set }) } },
  });

  test('a suppletive superlative keeps its set: the best, the worst', () => {
    expect(sayAll(most(np('CAT'), 'GOOD', ANIMALS))).toEqual({
      en: 'the cat is the best of the animals.',
      it: 'il gatto è il più buono degli animali.',
      fr: 'le chat est le meilleur des animaux.',
      de: 'der Kater ist das beste der Tiere.',
      es: 'el gato es el más bueno de los animales.',
      pt: 'o gato é o melhor dos animais.',
      ja: '猫は動物の中で最も良いです。',
    });
    expect(sayAll(most(np('CAT'), 'BAD', ANIMALS))).toEqual({
      en: 'the cat is the worst of the animals.',
      it: 'il gatto è il più cattivo degli animali.',
      fr: 'le chat est le pire des animaux.',
      de: 'der Kater ist das schlechteste der Tiere.',
      es: 'el gato es el más malo de los animales.',
      pt: 'o gato é o pior dos animais.',
      ja: '猫は動物の中で最も悪いです。',
    });
  });

  test('in a relative clause', () => {
    const relative = clause(np('CAT', {
      relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headStandard: ANIMALS }) } } },
    }), 'RUN');
    expect(sayAll(relative)).toEqual({
      en: 'the cat that is the biggest of the animals runs.',
      it: 'il gatto che è il più grande degli animali corre.',
      fr: 'le chat qui est le plus grand des animaux court.',
      de: 'der Kater, der das größte der Tiere ist, läuft.',
      es: 'el gato que es el más grande de los animales corre.',
      pt: 'o gato que é o maior dos animais corre.',
      ja: '動物の中で最も大きい猫は走ります。',
    });
  });

  test('under SEEM and BECOME', () => {
    expect(sayAll(most(np('CAT'), 'BIG', ANIMALS, 'SEEM'))).toEqual({
      en: 'the cat seems the biggest of the animals.',
      it: 'il gatto sembra il più grande degli animali.',
      fr: 'le chat semble le plus grand des animaux.',
      de: 'der Kater scheint das größte der Tiere.',
      es: 'el gato parece el más grande de los animales.',
      pt: 'o gato parece o maior dos animais.',
      ja: '猫は動物の中で最も大きく思えます。',
    });
    expect(sayAll(most(np('CAT'), 'BIG', ANIMALS, 'BECOME'))).toEqual({
      en: 'the cat becomes the biggest of the animals.',
      it: 'il gatto diventa il più grande degli animali.',
      fr: 'le chat devient le plus grand des animaux.',
      de: 'der Kater wird das größte der Tiere.',
      es: 'el gato se vuelve el más grande de los animales.',
      pt: 'o gato se torna o maior dos animais.',
      ja: '猫は動物の中で最も大きくなります。',
    });
  });

  test('the article and the adjective agree with a feminine plural subject', () => {
    expect(sayAll(most(np('WOMAN', { number: 'plural' }), 'BEAUTIFUL', np('FAMILY')))).toEqual({
      en: 'the women are the most beautiful in the family.',
      it: 'le donne sono le più belle della famiglia.',
      fr: 'les femmes sont les plus belles de la famille.',
      de: 'die Frauen sind die schönsten der Familie.',
      es: 'las mujeres son las más hermosas de la familia.',
      pt: 'as mulheres são as mais belas da família.',
      ja: '女は家族の中で最も美しいです。',
    });
    expect(sayAll(most(np('WOMAN'), 'BEAUTIFUL', np('WOMAN', { number: 'plural' })))).toEqual({
      en: 'the woman is the most beautiful of the women.',
      it: 'la donna è la più bella delle donne.',
      fr: 'la femme est la plus belle des femmes.',
      de: 'die Frau ist die schönste der Frauen.',
      es: 'la mujer es la más hermosa de las mujeres.',
      pt: 'a mulher é a mais bela das mulheres.',
      ja: '女は女の中で最も美しいです。',
    });
  });

  test('a third-person pronoun set, feminine and masculine', () => {
    expect(sayAll(most(np('WOMAN'), 'BEAUTIFUL', np('THIRD_PERSON', { number: 'plural', gender: 'fem' })))).toEqual({
      en: 'the woman is the most beautiful of them.',
      it: 'la donna è la più bella di loro.',
      fr: "la femme est la plus belle d'entre elles.",
      de: 'die Frau ist die schönste von ihnen.',
      es: 'la mujer es la más hermosa de ellas.',
      // de + elas contracts.
      pt: 'a mulher é a mais bela delas.',
      ja: '女は彼女らの中で最も美しいです。',
    });
    expect(sayAll(most(np('CAT'), 'BIG', np('THIRD_PERSON', { number: 'plural' })))).toEqual({
      en: 'the cat is the biggest of them.',
      it: 'il gatto è il più grande di loro.',
      fr: "le chat est le plus grand d'entre eux.",
      de: 'der Kater ist der größte von ihnen.',
      es: 'el gato es el más grande de ellos.',
      pt: 'o gato é o maior deles.',
      ja: '猫は彼らの中で最も大きいです。',
    });
  });

  test('a set with a demonstrative or a pronominal possessor', () => {
    expect(sayAll(most(np('CAT'), 'BIG', np('ANIMAL', { number: 'plural', definiteness: 'this' })))).toEqual({
      en: 'the cat is the biggest of these animals.',
      it: 'il gatto è il più grande di questi animali.',
      fr: 'le chat est le plus grand de ces animaux.',
      // The demonstrative takes the genitive as the article does.
      de: 'der Kater ist das größte dieser Tiere.',
      es: 'el gato es el más grande de estos animales.',
      pt: 'o gato é o maior destes animais.',
      ja: '猫はこの動物の中で最も大きいです。',
    });
    const mine = np('ANIMAL', { number: 'plural', possessor: { kind: 'pronominal', person: '1', number: 'singular' } });
    expect(sayAll(most(np('CAT'), 'BIG', mine))).toEqual({
      en: 'the cat is the biggest of my animals.',
      it: 'il gatto è il più grande dei miei animali.',
      fr: 'le chat est le plus grand de mes animaux.',
      de: 'der Kater ist das größte meiner Tiere.',
      es: 'el gato es el más grande de mis animales.',
      pt: 'o gato é o maior dos meus animais.',
      ja: '猫は私の動物の中で最も大きいです。',
    });
  });

  test('a standard with no degree is dropped: the plain positive', () => {
    const plain = { en: 'the cat is big.', it: 'il gatto è grande.', fr: 'le chat est grand.', de: 'der Kater ist groß.',
      es: 'el gato es grande.', pt: 'o gato é grande.', ja: '猫は大きいです。' };
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headStandard: ANIMALS }) } } }))).toEqual(plain);
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headStandard: DOG }) } } }))).toEqual(plain);
  });
});

// A284. Spanish and Portuguese pick estar for a transient predicate adjective ("está feliz"), but a
// superlative there is headed by its article — "el más feliz", "o mais feliz" — a noun phrase, and a
// predicate noun phrase takes ser: "el gato es el más feliz de los animales".
describe('known bugs: Spanish and Portuguese put estar before a transient superlative (A284)', () => {
  const happy = (degree: Degree, set?: NounElement): PhrasePlan => clause(np('CAT'), 'BE', {
    complements: { predicative: { phrase: np('HAPPY', { headDegree: degree, ...(set ? { headStandard: set } : {}) }) } },
  });
  const ANIMALS = np('ANIMAL', { number: 'plural' });

  test('with a set: es el gato es el más feliz, pt o gato é o mais feliz', () => {
    expect(sayAll(happy('most', ANIMALS))).toMatchObject({
      es: 'el gato es el más feliz de los animales.', pt: 'o gato é o mais feliz dos animais.',
    });
  });

  test('the bare superlative', () => {
    expect(sayAll(happy('most'))).toMatchObject({ es: 'el gato es el más feliz.', pt: 'o gato é o mais feliz.' });
  });

  test('least', () => {
    expect(sayAll(happy('least', ANIMALS))).toMatchObject({
      es: 'el gato es el menos feliz de los animales.', pt: 'o gato é o menos feliz dos animais.',
    });
  });

  test('ser follows the superlative through the tense, number, negation, a relative clause and an elided complement', () => {
    const pick = ({ es, pt }: Record<string, string>) => ({ es, pt });
    const most = (extra: Partial<PhrasePlan> = {}, subject: NounPhrase = np('CAT')): PhrasePlan => ({
      ...clause(subject, 'BE', { complements: { predicative: { phrase: np('HAPPY', { headDegree: 'most' }) } } }), ...extra,
    });
    expect(pick(sayAll(most({}, np('CAT', { number: 'plural' })))))
      .toEqual({ es: 'los gatos son los más felices.', pt: 'os gatos são os mais felizes.' });
    expect(pick(sayAll(clause(np('CAT'), 'BE', {
      verbPhrase: { tense: 'past' }, complements: { predicative: { phrase: np('HAPPY', { headDegree: 'most' }) } },
    })))).toEqual({ es: 'el gato era el más feliz.', pt: 'o gato era o mais feliz.' });
    expect(pick(sayAll(clause(np('CAT'), 'BE', {
      verbPhrase: { negative: true }, complements: { predicative: { phrase: np('HAPPY', { headDegree: 'most' }) } },
    })))).toEqual({ es: 'el gato no es el más feliz.', pt: 'o gato não é o mais feliz.' });
    expect(pick(sayAll(clause(np('HOUSE', {
      relative: { headRole: 'subject', verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('FAR', { headDegree: 'most' }) } } },
    }), 'BURN')))).toEqual({ es: 'la casa que es la más lejana arde.', pt: 'a casa que é a mais distante arde.' });
    expect(pick(sayAll(most({ coordination: { conjunction: 'but', clause: clause(np('DOG'), 'BE', { verbPhrase: { negative: true } }) } }))))
      .toEqual({ es: 'el gato es el más feliz, pero el perro no lo es.', pt: 'o gato é o mais feliz, mas o cão não é.' });
  });

  test('regression: the other five, and estar for the positive and the comparative', () => {
    expect(sayAll(happy('most', ANIMALS))).toMatchObject({
      en: 'the cat is the happiest of the animals.',
      it: 'il gatto è il più felice degli animali.',
      fr: 'le chat est le plus heureux des animaux.',
      de: 'der Kater ist das glücklichste der Tiere.',
      ja: '猫は動物の中で最も幸せです。',
    });
    expect(sayAll(happy('positive'))).toMatchObject({ es: 'el gato está feliz.', pt: 'o gato está feliz.' });
    expect(sayAll(happy('more'))).toMatchObject({ es: 'el gato está más feliz.', pt: 'o gato está mais feliz.' });
  });
});

// A285. Japanese says the least-degree by negating the superlative (最も大きくない, "the least big"),
// so a negated superlative that negates the adjective too comes out the same: "the cat is not the
// biggest" reads as "the cat is the least big". The negation denies the superlative proposition, and
// goes over it as A249's does: 最も大きいわけではありません.
describe('known bugs: Japanese reads a negated superlative as the least (A285)', () => {
  const notMost = (set?: NounElement, tense?: 'past'): PhrasePlan => clause(np('CAT'), 'BE', {
    verbPhrase: { negative: true, ...(tense ? { tense } : {}) },
    complements: { predicative: { phrase: np('BIG', { headDegree: 'most', ...(set ? { headStandard: set } : {}) }) } },
  });
  const ANIMALS = np('ANIMAL', { number: 'plural' });

  test('with a set: 動物の中で最も大きいわけではありません', () => {
    expect(say(notMost(ANIMALS), 'ja')).toBe('猫は動物の中で最も大きいわけではありません。');
  });

  test('the bare superlative: 最も大きいわけではありません', () => {
    expect(say(notMost(), 'ja')).toBe('猫は最も大きいわけではありません。');
  });

  test('in the past: 最も大きいわけではありませんでした', () => {
    expect(say(notMost(ANIMALS, 'past'), 'ja')).toBe('猫は動物の中で最も大きいわけではありませんでした。');
  });

  test('regression: the six European languages, and the affirmative least', () => {
    expect(sayAll(notMost(ANIMALS))).toMatchObject({
      en: 'the cat is not the biggest of the animals.',
      it: 'il gatto non è il più grande degli animali.',
      fr: "le chat n'est pas le plus grand des animaux.",
      de: 'der Kater ist nicht das größte der Tiere.',
      es: 'el gato no es el más grande de los animales.',
      pt: 'o gato não é o maior dos animais.',
    });
    expect(say(cat('least', ANIMALS), 'ja')).toBe('猫は動物の中で最も大きくないです。');
    expect(say(cat('least'), 'ja')).toBe('猫は最も大きくないです。');
  });

  test('the other adjective classes put their prenominal superlative under わけ', () => {
    const neg = { verbPhrase: { verb: 'BE', negative: true } } as Partial<PhrasePlan>;
    expect({
      happy: say(cat('most', undefined, 'HAPPY', neg), 'ja'),
      tired: say(cat('most', undefined, 'TIRED', neg), 'ja'),
      happyAff: say(cat('most', undefined, 'HAPPY'), 'ja'),
      happyLeast: say(cat('least', undefined, 'HAPPY'), 'ja'),
    }).toEqual({
      // Built on the prenominal な of 最も幸せな猫; the least stays the negated copula.
      happy: '猫は最も幸せなわけではありません。',
      tired: '猫は最も疲れているわけではありません。',
      happyAff: '猫は最も幸せです。',
      happyLeast: '猫は最も幸せではないです。',
    });
  });

  test('in a relative clause: the plain わけではない before the head', () => {
    const catWhoIsNotMost = (tense?: 'past') => clause(np('CAT', {
      relative: {
        verbPhrase: { verb: 'BE', negative: true, ...(tense ? { tense } : {}) },
        complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headStandard: ANIMALS }) } },
      },
    }), 'RUN');
    expect({ now: say(catWhoIsNotMost(), 'ja'), past: say(catWhoIsNotMost('past'), 'ja') }).toEqual({
      now: '動物の中で最も大きいわけではない猫は走ります。',
      past: '動物の中で最も大きいわけではなかった猫は走ります。',
    });
  });

  test('regression: the negated least keeps A249\'s わけ, and the affirmative most is unchanged', () => {
    const negLeast = cat('least', ANIMALS, 'BIG', { verbPhrase: { verb: 'BE', negative: true } } as Partial<PhrasePlan>);
    expect({ negLeast: say(negLeast, 'ja'), most: say(cat('most', ANIMALS), 'ja') }).toEqual({
      negLeast: '猫は動物の中で最も大きくないわけではありません。',
      most: '猫は動物の中で最も大きいです。',
    });
  });
});

// A286. German's superlative set is a bare genitive after a noun and "von" + the dative after a
// pronoun (P09-E19). A coordinated set that starts with a pronoun puts "von" before the whole group,
// so the noun after "und" is under "von" too and must be dative: "von uns und den Hunden".
describe('known bugs: German leaves a noun genitive after "von" in a coordinated set (A286)', () => {
  const set = (conjuncts: NounPhrase[]) => cat('most', { conjuncts, conjunction: 'and' });
  const US = np('FIRST_PERSON', { number: 'plural' });
  const DOGS = np('DOG', { number: 'plural' });

  test('von uns und den Hunden', () => {
    expect(say(set([US, DOGS]), 'de')).toBe('der Kater ist der größte von uns und den Hunden.');
  });

  test('von once before any mixed set, every conjunct dative: noun first, three conjuncts, or', () => {
    expect(say(set([DOGS, US]), 'de')).toBe('der Kater ist der größte von den Hunden und uns.');
    expect(say(set([np('ANIMAL', { number: 'plural' }), US, np('MAN', { number: 'plural' })]), 'de'))
      .toBe('der Kater ist der größte von den Tieren, uns und den Männern.');
    expect(say(set([np('SECOND_PERSON', { number: 'plural' }), US]), 'de')).toBe('der Kater ist der größte von euch und uns.');
    expect(say(cat('most', { conjuncts: [np('FAMILY'), US], conjunction: 'or' }), 'de')).toBe('der Kater ist der größte von der Familie oder uns.');
    expect(say(set([US]), 'de')).toBe('der Kater ist der größte von uns.');
  });

  test('regression: the other languages, and a set of nouns alone', () => {
    expect(sayAll(set([US, DOGS]))).toMatchObject({
      en: 'the cat is the biggest of us and the dogs.',
      it: 'il gatto è il più grande di noi e dei cani.',
      es: 'el gato es el más grande de nosotros y de los perros.',
      pt: 'o gato é o maior de nós e dos cães.',
      ja: '猫は私たちと犬の中で最も大きいです。',
    });
    expect(say(set([np('ANIMAL', { number: 'plural' }), DOGS]), 'de')).toBe('der Kater ist der größte der Tiere und der Hunde.');
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

  // Romance puts it ahead of the compared adjective (A271 in Italian, A372 in the others), where it
  // cannot read as the standard's possessor.
  test('a genitive possessor goes ahead of the compared adjective and its standard (A271, A372)', () => {
    expect(sayAll(sees(compared('CAT', 'more', DOG, { possessor: np('WOMAN') })))).toMatchObject({
      it: "l'uomo vede un gatto della donna più grande del cane.",
      fr: "l'homme voit un chat de la femme plus grand que le chien.",
      es: 'el hombre ve un gato de la mujer más grande que el perro.',
      pt: 'o homem vê um gato da mulher maior do que o cão.',
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

  // A superlative's is its set, which renders (A371, below).
  test('a standard on a positive adjective is dropped', () => {
    const plain = (degree: Degree) => sees(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: [degree] }));
    expect(sayAll(sees(compared('CAT', 'positive')))).toEqual(sayAll(plain('positive')));
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

  test('a passive agent: German "von" gives the dative, and the standard follows it', () => {
    expect(sayAll(clause(compared('CAT', 'more'), 'EAT', {
      directObject: np('FOOD', { definiteness: 'definite' }), verbPhrase: { voice: 'passive' },
    }))).toEqual({
      en: 'the food is eaten by a bigger cat than the dog.',
      it: 'il cibo è mangiato da un gatto più grande del cane.',
      fr: 'la nourriture est mangée par un chat plus grand que le chien.',
      de: 'das Essen wird von einem größeren Kater als dem Hund gefressen.',
      es: 'la comida es comida por un gato más grande que el perro.',
      pt: 'a comida é comida por um gato maior do que o cão.',
      ja: '食べ物は犬より大きい猫に食べられます。',
    });
  });

  test('a comitative: "mit" gives the dative', () => {
    expect(sayAll(clause(np('MAN'), 'RUN', { complements: { comitative: { phrase: compared('CAT', 'more') } } }))).toEqual({
      en: 'the man runs with a bigger cat than the dog.',
      it: "l'uomo corre con un gatto più grande del cane.",
      fr: "l'homme court avec un chat plus grand que le chien.",
      de: 'der Mann läuft mit einem größeren Kater als dem Hund.',
      es: 'el hombre corre con un gato más grande que el perro.',
      pt: 'o homem corre com um gato maior do que o cão.',
      ja: '男は犬より大きい猫と走ります。',
    });
  });

  test('a possessor: the German genitive, and the standard in it', () => {
    expect(sayAll(sees(np('BOOK', { possessor: compared('CAT', 'more') })))).toEqual({
      en: 'the man sees the book of a bigger cat than the dog.',
      it: "l'uomo vede il libro di un gatto più grande del cane.",
      fr: "l'homme voit le livre d'un chat plus grand que le chien.",
      de: 'der Mann sieht das Buch eines größeren Katers als des Hundes.',
      es: 'el hombre ve el libro de un gato más grande que el perro.',
      pt: 'o homem vê o livro de um gato maior do que o cão.',
      ja: '男は犬より大きい猫の本を見ます。',
    });
  });

  test('German: weak, strong and mixed declension, and the feminine', () => {
    expect(say(sees(compared('CAT', 'more', DOG, { definiteness: 'definite' })), 'de')).toBe('der Mann sieht den größeren Kater als den Hund.');
    expect(say(clause(compared('CAT', 'more', DOG, { definiteness: 'definite' }), 'EAT'), 'de')).toBe('der größere Kater als der Hund frisst.');
    expect(say(sees(compared('CAT', 'more', DOG, { number: 'plural', definiteness: 'bare' })), 'de')).toBe('der Mann sieht größere Kater als den Hund.');
    // The possessive's mixed declension needs the definite: an indefinite possessed head keeps its
    // article and detaches the possessive (A277), "einen größeren Kater von ihm als den Hund".
    expect(say(sees(compared('CAT', 'more', DOG, {
      definiteness: 'definite', possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' },
    })), 'de')).toBe('der Mann sieht seinen größeren Kater als den Hund.');
    expect(say(sees(compared('CAT', 'more', DOG, { gender: 'fem' })), 'de')).toBe('der Mann sieht eine größere Katze als den Hund.');
  });

  test('a pronoun standard, in the object and in the subject', () => {
    expect(sayAll(sees(compared('CAT', 'more', np('FIRST_PERSON'))))).toEqual({
      en: 'the man sees a bigger cat than me.',
      it: "l'uomo vede un gatto più grande di me.",
      fr: "l'homme voit un chat plus grand que moi.",
      de: 'der Mann sieht einen größeren Kater als mich.',
      // Spanish and Portuguese keep the subject form after "que", as E5's predicate does.
      es: 'el hombre ve un gato más grande que yo.',
      pt: 'o homem vê um gato maior do que eu.',
      ja: '男は私より大きい猫を見ます。',
    });
    expect(sayAll(clause(compared('CAT', 'more', np('FIRST_PERSON')), 'EAT'))).toEqual({
      en: 'a bigger cat than me eats.',
      it: 'un gatto più grande di me mangia.',
      fr: 'un chat plus grand que moi mange.',
      de: 'ein größerer Kater als ich frisst.',
      es: 'un gato más grande que yo come.',
      pt: 'um gato maior do que eu come.',
      ja: '私より大きい猫は食べます。',
    });
  });

  test('Romance: the compared adjective agrees with a feminine plural head', () => {
    expect(sayAll(sees(compared('CAT', 'equally', DOG, { gender: 'fem', number: 'plural' })))).toEqual({
      en: 'the man sees cats as big as the dog.',
      it: "l'uomo vede gatte tanto grandi quanto il cane.",
      fr: "l'homme voit des chattes aussi grandes que le chien.",
      de: 'der Mann sieht so große Katzen wie den Hund.',
      es: 'el hombre ve unas gatas tan grandes como el perro.',
      pt: 'o homem vê umas gatas tão grandes como o cão.',
      ja: '男は犬と同じくらい大きい猫を見ます。',
    });
    expect(sayAll(sees(compared('CAT', 'more', DOG, { number: 'plural' })))).toEqual({
      en: 'the man sees bigger cats than the dog.',
      it: "l'uomo vede gatti più grandi del cane.",
      fr: "l'homme voit des chats plus grands que le chien.",
      de: 'der Mann sieht größere Kater als den Hund.',
      es: 'el hombre ve unos gatos más grandes que el perro.',
      pt: 'o homem vê uns gatos maiores do que o cão.',
      ja: '男は犬より大きい猫を見ます。',
    });
  });

  test('a prenominal positive adjective beside the compared one', () => {
    expect(sayAll(sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BEAUTIFUL', 'BIG'], adjectiveDegrees: ['positive', 'more'], adjectiveStandards: [undefined, DOG],
    })))).toEqual({
      en: 'the man sees a beautiful bigger cat than the dog.',
      // Italian and French keep BEAUTIFUL before the noun; Spanish and Portuguese coordinate it after.
      it: "l'uomo vede un bel gatto più grande del cane.",
      fr: "l'homme voit un beau chat plus grand que le chien.",
      de: 'der Mann sieht einen schönen größeren Kater als den Hund.',
      es: 'el hombre ve un gato hermoso y más grande que el perro.',
      pt: 'o homem vê um gato belo e maior do que o cão.',
      ja: '男は犬より大きい美しい猫を見ます。',
    });
  });

  test('Italian "di" fuses with the standard\'s article, French "que" elides', () => {
    expect(say(sees(compared('CAT', 'more', np('UNCLE'))), 'it')).toBe("l'uomo vede un gatto più grande dello zio.");
    expect(say(sees(compared('CAT', 'more', np('MAN'))), 'it')).toBe("l'uomo vede un gatto più grande dell'uomo.");
    expect(say(sees(compared('CAT', 'more', np('DOG', { number: 'plural' }))), 'it')).toBe("l'uomo vede un gatto più grande dei cani.");
    expect(sayAll(sees(compared('CAT', 'more', np('DOG', { definiteness: 'indefinite' }))))).toEqual({
      en: 'the man sees a bigger cat than a dog.',
      it: "l'uomo vede un gatto più grande di un cane.",
      fr: "l'homme voit un chat plus grand qu'un chien.",
      de: 'der Mann sieht einen größeren Kater als einen Hund.',
      es: 'el hombre ve un gato más grande que un perro.',
      pt: 'o homem vê um gato maior do que um cão.',
      ja: '男は犬より大きい猫を見ます。',
    });
  });

  test('Japanese: the compared adjective leads a possessor, a relative clause and a numeral', () => {
    expect(say(sees(compared('CAT', 'more', DOG, { possessor: np('WOMAN') })), 'ja')).toBe('男は犬より大きい女の猫を見ます。');
    expect(say(sees(compared('CAT', 'more', DOG, { relative: { verbPhrase: { verb: 'RUN' } } })), 'ja')).toBe('男は犬より大きい走る猫を見ます。');
    expect(say(sees(compared('CAT', 'more', DOG, { numeral: 2, number: 'plural' })), 'ja')).toBe('男は犬より大きい二匹の猫を見ます。');
  });

  test('VERY on the compared adjective: much bigger', () => {
    expect(sayAll(sees(compared('CAT', 'more', DOG, { adjectiveIntensifiers: ['VERY'] })))).toEqual({
      en: 'the man sees a much bigger cat than the dog.',
      it: "l'uomo vede un gatto molto più grande del cane.",
      fr: "l'homme voit un chat bien plus grand que le chien.",
      de: 'der Mann sieht einen viel größeren Kater als den Hund.',
      es: 'el hombre ve un gato mucho más grande que el perro.',
      pt: 'o homem vê um gato muito maior do que o cão.',
      // The standard leads ずっと.
      ja: '男は犬よりずっと大きい猫を見ます。',
    });
  });
});

// A283. English VERY drops "just" before a noun (`attributive_drop_degrees`), since there is no "a
// just as big cat". But an equative with a standard now stands after the noun (P09-E18), where
// "just as big as the dog" is what the predicate says too; the drop still fires there, and "a cat as
// big as the dog" has lost the intensifier the other six keep.
describe('known bugs: English drops "just" from a postposed equative with VERY (A283)', () => {
  const justAs = (concept = 'CAT', extra: Partial<NounPhrase> = {}): NounPhrase => np(concept, {
    definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['equally'], adjectiveStandards: [DOG], adjectiveIntensifiers: ['VERY'], ...extra,
  });
  const sees = (object: NounPhrase): PhrasePlan => clause(np('MAN'), 'SEE', { directObject: object });

  test('as the object: a cat just as big as the dog', () => {
    expect(say(sees(justAs()), 'en')).toBe('the man sees a cat just as big as the dog.');
  });

  test('as the subject', () => {
    expect(say(clause(justAs(), 'EAT'), 'en')).toBe('a cat just as big as the dog eats.');
  });

  test('as a predicate noun', () => {
    expect(say(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: justAs('ANIMAL') } } }), 'en'))
      .toBe('the cat is an animal just as big as the dog.');
  });

  test('regression: the other six keep their intensifier', () => {
    expect(sayAll(sees(justAs()))).toMatchObject({
      it: "l'uomo vede un gatto altrettanto grande quanto il cane.",
      fr: "l'homme voit un chat tout aussi grand que le chien.",
      de: 'der Mann sieht einen genauso großen Kater wie den Hund.',
      es: 'el hombre ve un gato igual de grande que el perro.',
      pt: 'o homem vê um gato tão grande como o cão.',
      ja: '男は犬と同じくらい大きい猫を見ます。',
    });
  });

  test('definite and plural heads keep "just" behind the noun', () => {
    expect(say(sees(justAs('CAT', { definiteness: 'definite' })), 'en')).toBe('the man sees the cat just as big as the dog.');
    expect(say(sees(justAs('CAT', { number: 'plural' })), 'en')).toBe('the man sees cats just as big as the dog.');
  });

  test('only the adjective with the standard keeps "just"; a second equative before the noun still drops it', () => {
    expect(say(sees(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG', 'SMALL'], adjectiveDegrees: ['equally', 'equally'],
      adjectiveStandards: [DOG], adjectiveIntensifiers: ['VERY', 'VERY'],
    })), 'en')).toBe('the man sees an equally small cat just as big as the dog.');
  });

  test('regression: a comparative with a standard stays before the noun with "much"', () => {
    expect(say(sees(justAs('CAT', { adjectiveDegrees: ['more'] })), 'en')).toBe('the man sees a much bigger cat than the dog.');
  });

  test('regression: before the noun, with no standard, "just" still drops; the predicate keeps it', () => {
    expect(say(sees(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['equally'], adjectiveIntensifiers: ['VERY'] })), 'en'))
      .toBe('the man sees an equally big cat.');
    expect(say(sees(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['VERY'] })), 'en'))
      .toBe('the man sees a very big cat.');
    expect(say(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'equally', headIntensifier: 'VERY', headStandard: DOG }) } },
    }), 'en')).toBe('the cat is just as big as the dog.');
  });
});

// A371. An attributive superlative's set (P09-E19, E51 D4) is dropped: `adjectiveStandards` on `most`
// or `least` reaches no language, so "the man sees the biggest house in the city" loses its set.
// The predicate superlative says it (the regression test below), which is where the Wants come from.
describe('known bugs: an attributive superlative drops its set (A371)', () => {
  const sees = (degree: Degree) =>
    sayAll(clause(np('MAN'), 'SEE', { directObject: np('HOUSE', { adjectives: ['BIG'], adjectiveDegrees: [degree], adjectiveStandards: [np('CITY')] }) }));

  test('the object "the biggest house in the city"', () => {
    expect(sees('most')).toEqual({
      en: 'the man sees the biggest house in the city.', // now: "the man sees the biggest house."
      it: "l'uomo vede la casa più grande della città.",
      fr: "l'homme voit la maison la plus grande de la ville.",
      de: 'der Mann sieht das größte Haus der Stadt.',
      es: 'el hombre ve la casa más grande de la ciudad.',
      ja: '男は都市の中で最も大きい家を見ます。',
      pt: 'o homem vê a maior casa da cidade.',
    });
  });

  test('the predicate superlative says its set', () => {
    expect(sayAll(clause(np('HOUSE'), 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headStandard: np('CITY') }) } } }))).toEqual({
      en: 'the house is the biggest in the city.',
      it: 'la casa è la più grande della città.',
      fr: 'la maison est la plus grande de la ville.',
      de: 'das Haus ist das größte der Stadt.',
      es: 'la casa es la más grande de la ciudad.',
      ja: '家は都市の中で最も大きいです。',
      pt: 'a casa é a maior da cidade.',
    });
  });

  test('least says its set the same way', () => {
    expect(sees('least')).toEqual({
      en: 'the man sees the least big house in the city.',
      it: "l'uomo vede la casa meno grande della città.",
      fr: "l'homme voit la maison la moins grande de la ville.",
      de: 'der Mann sieht das am wenigsten große Haus der Stadt.',
      es: 'el hombre ve la casa menos grande de la ciudad.',
      ja: '男は都市の中で最も大きくない家を見ます。',
      pt: 'o homem vê a casa menos grande da cidade.',
    });
  });

  test('as the subject, and in a prepositional complement', () => {
    expect(sayAll(clause(np('HOUSE', { adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [np('CITY')] }), 'RUN'))).toMatchObject({
      en: 'the biggest house in the city runs.',
      de: 'das größte Haus der Stadt läuft.',
      pt: 'a maior casa da cidade corre.',
      ja: '都市の中で最も大きい家は走ります。',
    });
    const woman = np('WOMAN', { adjectives: ['BEAUTIFUL'], adjectiveDegrees: ['most'], adjectiveStandards: [np('CITY')] });
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: woman } } }))).toEqual({
      en: 'the man gives the book to the most beautiful woman in the city.',
      it: "l'uomo dà il libro alla donna più bella della città.",
      fr: "l'homme donne le livre à la femme la plus belle de la ville.",
      // The set is genitive whatever the phrase's case.
      de: 'der Mann gibt der schönsten Frau der Stadt das Buch.',
      es: 'el hombre da el libro a la mujer más hermosa de la ciudad.',
      ja: '男は都市の中で最も美しい女に本をあげます。',
      pt: 'o homem dá o livro à mulher mais bela da cidade.',
    });
  });

  // The set goes where the comparative's standard goes: Romance writes the possessor ahead of the
  // adjective (A372), a relative clause closing the phrase; English keeps its Saxon genitive.
  test('beside a possessor and a relative clause', () => {
    const house = np('HOUSE', {
      adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [np('CITY')], possessor: np('WOMAN'),
      relative: { verbPhrase: { verb: 'RUN' } },
    });
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: house }))).toMatchObject({
      en: "the man sees the woman's biggest house in the city that runs.",
      it: "l'uomo vede la casa della donna più grande della città che corre.",
      fr: "l'homme voit la maison de la femme la plus grande de la ville qui court.",
      es: 'el hombre ve la casa de la mujer más grande de la ciudad que corre.',
      // The suppletive superlative stands before the noun (A178), so only its set follows the possessor,
      // said as a place so it does not read as the woman's (A380).
      pt: 'o homem vê a maior casa da mulher na cidade que corre.',
    });
  });

  test('Portuguese: a plain adjective stays with the noun when only the set follows the possessor', () => {
    const house = np('HOUSE', {
      adjectives: ['OLD', 'BIG'], adjectiveDegrees: ['positive', 'most'], adjectiveStandards: [undefined, np('CITY')], possessor: np('WOMAN'),
    });
    expect(say(clause(np('MAN'), 'SEE', { directObject: house }), 'pt')).toBe('o homem vê a maior casa velha da mulher na cidade.');
  });
});

// A380. An attributive superlative's set beside a noun possessor stacks two genitives in German and
// Portuguese: "das größte Haus der Frau der Stadt", "a maior casa da mulher da cidade", where the set
// reads as the woman's ("the woman of the city"). A371 put the set where the comparative's standard
// goes, after the possessor. Found by the A371 lane, 2026-09-25. Decision for the fixer: the set as a
// locative (pinned, "in der Stadt", "na cidade", English's own "in the city"), or ahead of the possessor.
describe('known bugs: a superlative’s set beside a possessor stacks two genitives in de / pt (A380)', () => {
  const house = (degree: Degree) =>
    np('HOUSE', { adjectives: ['BIG'], adjectiveDegrees: [degree], adjectiveStandards: [np('CITY')], possessor: np('WOMAN') });

  test('the set is said as a place', () => {
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: house('most') }))).toMatchObject({
      de: 'der Mann sieht das größte Haus der Frau in der Stadt.', // now: "… der Frau der Stadt."
      pt: 'o homem vê a maior casa da mulher na cidade.', // now: "… da mulher da cidade."
    });
    expect(sayAll(clause(house('most'), 'BURN'))).toMatchObject({
      de: 'das größte Haus der Frau in der Stadt brennt.', // now: "… der Frau der Stadt brennt."
      pt: 'a maior casa da mulher na cidade arde.', // now: "… da mulher da cidade arde."
    });
  });

  test('least, a masculine, a plural and an indefinite set, and a dative phrase', () => {
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: house('least') })).de).toBe('der Mann sieht das am wenigsten große Haus der Frau in der Stadt.');
    const inSet = (set: NounPhrase) =>
      sayAll(clause(np('MAN'), 'SEE', { directObject: np('HOUSE', { adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [set], possessor: np('WOMAN') }) }));
    expect(inSet(np('MARKET'))).toMatchObject({
      de: 'der Mann sieht das größte Haus der Frau im Markt.', pt: 'o homem vê a maior casa da mulher no mercado.',
    });
    expect(inSet(np('MARKET', { number: 'plural' }))).toMatchObject({
      de: 'der Mann sieht das größte Haus der Frau in den Märkten.', pt: 'o homem vê a maior casa da mulher nos mercados.',
    });
    expect(inSet(np('MARKET', { definiteness: 'indefinite' }))).toMatchObject({
      de: 'der Mann sieht das größte Haus der Frau in einem Markt.', pt: 'o homem vê a maior casa da mulher em um mercado.',
    });
    const cat = np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [np('CITY')], possessor: np('WOMAN') });
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: cat } } }))).toMatchObject({
      de: 'der Mann gibt dem größten Kater der Frau in der Stadt das Buch.', pt: 'o homem dá o livro ao maior gato da mulher na cidade.',
    });
  });

  test('regression: a comparative’s standard keeps its "als"', () => {
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: house('more') })).de).toBe('der Mann sieht das größere Haus der Frau als die Stadt.');
  });

  test('regression: without a possessor the set stays genitive, and English says it in place', () => {
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: np('HOUSE', { adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [np('CITY')] }) }))).toMatchObject({
      de: 'der Mann sieht das größte Haus der Stadt.', pt: 'o homem vê a maior casa da cidade.',
    });
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: house('most') })).en).toBe("the man sees the woman's biggest house in the city.");
  });
});

// A372. French, Spanish and Portuguese write a noun's possessor after its attributive standard (P09-E18,
// E50), where it reads as the standard's: "un chat plus grand que le chien de la femme" is a cat bigger
// than the woman's dog. Italian puts the possessor first, which is the order the three want.
describe('known bugs: fr / es / pt write a possessor after an attributive standard (A372)', () => {
  const runs = () =>
    sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [DOG], possessor: np('WOMAN') }), 'RUN'));

  test('the possessor ahead of the standard', () => {
    expect(runs()).toMatchObject({
      fr: 'un chat de la femme plus grand que le chien court.', // now: "… plus grand que le chien de la femme court."
      es: 'un gato de la mujer más grande que el perro corre.', // now: "… más grande que el perro de la mujer corre."
      pt: 'um gato da mulher maior do que o cão corre.', // now: "… maior do que o cão da mulher corre."
    });
  });

  // Every post-nominal adjective follows the possessor, as in Italian, so the coordination stays whole;
  // a relative clause still closes the phrase, and a complement's noun phrase does the same.
  const brownCat = np('CAT', {
    definiteness: 'indefinite', adjectives: ['BROWN', 'BIG'], adjectiveDegrees: ['positive', 'more'], adjectiveStandards: [undefined, DOG],
    possessor: np('WOMAN'),
  });

  test('the other post-nominal adjectives follow it too, and a relative clause closes the phrase', () => {
    expect(sayAll(clause(np('MAN'), 'SEE', { directObject: { ...brownCat, relative: { verbPhrase: { verb: 'RUN' } } } }))).toMatchObject({
      it: "l'uomo vede un gatto della donna marrone e più grande del cane che corre.",
      fr: "l'homme voit un chat de la femme brun et plus grand que le chien qui court.",
      es: 'el hombre ve un gato de la mujer marrón y más grande que el perro que corre.',
      pt: 'o homem vê um gato da mulher castanho e maior do que o cão que corre.',
    });
  });

  test('in a prepositional complement', () => {
    expect(sayAll(clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: brownCat } } }))).toMatchObject({
      fr: "l'homme donne le livre à un chat de la femme brun et plus grand que le chien.",
      es: 'el hombre da el libro a un gato de la mujer marrón y más grande que el perro.',
      pt: 'o homem dá o livro a um gato da mulher castanho e maior do que o cão.',
    });
  });

  test('a pronominal possessor stands before the noun and moves nothing', () => {
    const hers = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [DOG], possessor: hers }), 'RUN'))).toMatchObject({
      fr: 'son chat plus grand que le chien court.',
      es: 'su gato más grande que el perro corre.',
      pt: 'o seu gato maior do que o cão corre.',
    });
  });

  test('Italian and German already keep it with the noun', () => {
    expect(runs()).toMatchObject({
      it: 'un gatto della donna più grande del cane corre.',
      de: 'ein größerer Kater der Frau als der Hund läuft.',
    });
  });
});

