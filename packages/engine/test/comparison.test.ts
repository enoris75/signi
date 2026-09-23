import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// P09-E5: the standard of comparison — what a predicate adjective's degree compares it *to*. The
// word is the degree's, not a constant: than / di / que / als / que / do que / より for the
// comparatives, and for the equative a circumfix whose first half replaces the degree adverb itself
// (as … as, tanto … quanto, aussi … que, so … wie, tan … como, tão … como, と同じくらい). Japanese puts the
// standard before the adjective, in the adverb's place, and lowers a degree by negating it (犬ほど
// 大きくない). Predicative only (D2); a superlative drops its standard (D3).

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

describe('the superlative takes no standard (D3)', () => {
  test('most + a standard renders the plain superlative', () => {
    expect(sayAll(cat('most', np('DOG', { number: 'plural' })))).toEqual(sayAll(cat('most')));
    expect(sayAll(cat('most', DOG))).toEqual({
      en: 'the cat is biggest.',
      it: 'il gatto è il più grande.',
      fr: 'le chat est le plus grand.',
      de: 'der Kater ist am größten.',
      es: 'el gato es el más grande.',
      pt: 'o gato é o maior.',
      ja: '猫は最も大きいです。',
    });
  });

  test('so do least and positive', () => {
    expect(sayAll(cat('least', DOG))).toEqual(sayAll(cat('least')));
    expect(sayAll(cat('positive', DOG))).toEqual(sayAll(cat('positive')));
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
