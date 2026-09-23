import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C33: an intensifier on an adjective — VERY and TOO. It is an adverb concept of its
// own, so it is looked up per language like any word; where it goes is its lexeme's business, and
// three answers exist: before the adjective (six languages, and pt muito), after it (pt demais),
// and as a suffix on its stem that turns the adjective into a verb (ja 〜すぎる).

const seed = (id: string) => concepts.find((c) => c.id === id);

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = seed(id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('an intensifier inside the noun phrase', () => {
  test('VERY leads the adjective in every language', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toEqual({
      en: 'a very big cat runs.', it: 'un gatto molto grande corre.', fr: 'un chat très grand court.',
      de: 'ein sehr großer Kater läuft.', es: 'un gato muy grande corre.', ja: 'とても大きい猫は走ります。',
      pt: 'um gato muito grande corre.',
    });
  });

  test('TOO follows it in Portuguese and is a suffix in Japanese', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['TOO'],
    }), 'RUN'))).toEqual({
      en: 'a too big cat runs.', it: 'un gatto troppo grande corre.', fr: 'un chat trop grand court.',
      de: 'ein zu großer Kater läuft.', es: 'un gato demasiado grande corre.', ja: '大きすぎる猫は走ります。',
      pt: 'um gato grande demais corre.',
    });
  });

  test('the adjective still agrees, and the intensifier never does', () => {
    expect(sayAll(clause(np('HOUSE', {
      number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toMatchObject({
      it: 'case molto grandi corrono.', fr: 'des maisons très grandes courent.',
      es: 'unas casas muy grandes corren.', pt: 'umas casas muito grandes correm.',
      de: 'sehr große Häuser laufen.',
    });
  });

  // …in the comparative's own word where the language has one (A248).
  test('it stacks outside a comparative degree', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toMatchObject({
      it: 'un gatto molto più grande corre.', es: 'un gato mucho más grande corre.',
      en: 'a much bigger cat runs.',
    });
  });

  // An intensified adjective follows the noun in Romance, as a compared one does — and OTHER then
  // gives the indefinite article back, since it no longer stands where the article would.
  test('an intensified prenominal adjective moves behind the noun', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['OTHER'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toMatchObject({
      it: 'un gatto molto altro corre.', fr: 'un chat très autre court.',
      es: 'un gato muy otro corre.', pt: 'um gato muito outro corre.',
    });
    // Without one, OTHER leads and Iberian Romance drops the article (the shape A-side already had).
    expect(sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['OTHER'] }), 'RUN')))
      .toMatchObject({ es: 'otro gato corre.', pt: 'outro gato corre.', it: 'un altro gatto corre.' });
  });
});

describe('an intensifier on a predicate adjective', () => {
  test('VERY and TOO under the copula', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headIntensifier: 'VERY' }) } },
    }))).toEqual({
      en: 'the cat is very big.', it: 'il gatto è molto grande.', fr: 'le chat est très grand.',
      de: 'der Kater ist sehr groß.', es: 'el gato es muy grande.', ja: '猫はとても大きいです。',
      pt: 'o gato é muito grande.',
    });
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headIntensifier: 'TOO' }) } },
    }))).toEqual({
      en: 'the cat is too big.', it: 'il gatto è troppo grande.', fr: 'le chat est trop grand.',
      de: 'der Kater ist zu groß.', es: 'el gato es demasiado grande.', ja: '猫は大きすぎます。',
      pt: 'o gato é grande demais.',
    });
  });

  // 〜すぎる is an ichidan verb, so the Japanese predicate inflects as one: tense and polarity come
  // off the suffix, not off the adjective (大きすぎませんでした, never 大きすぎるくなかったです).
  test('the Japanese suffix carries the tense and the negation', () => {
    const past = (id: string) => say(clause(np('CAT'), 'BE', {
      verbPhrase: { tense: 'past', negative: true },
      complements: { predicative: { phrase: np('BIG', { headIntensifier: id }) } },
    }), 'ja');
    expect(past('VERY')).toBe('猫はとても大きくなかったです。');
    expect(past('TOO')).toBe('猫は大きすぎませんでした。');
  });

  test('the suffix takes each adjective class by its own stem', () => {
    // い-adjective 大きい → 大き, な-adjective 幸せな → 幸せ, た-adjective 疲れた → 疲れ.
    const tooJa = (adjective: string) => say(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np(adjective, { headIntensifier: 'TOO' }) } },
    }), 'ja');
    expect(tooJa('BIG')).toBe('猫は大きすぎます。');
    expect(tooJa('HAPPY')).toBe('猫は幸せすぎます。');
    expect(tooJa('TIRED')).toBe('猫は疲れすぎます。');
    // …and attributively it is the verb's prenominal form, which is the dictionary one.
    expect(say(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['HAPPY'], adjectiveIntensifiers: ['TOO'],
    }), 'RUN'), 'ja')).toBe('幸せすぎる猫は走ります。');
  });
});

describe('the words themselves', () => {
  // VERY is UP's direction complement on LEVEL instead of PLACE. TOO's "to an excessive level" has
  // no word in the corpus, so it stays on the English literal (see the ticket's probe table).
  test('VERY is glossed and TOO is not', () => {
    expect(definitionAll('VERY')).toEqual({
      en: 'to a high level.', it: 'a un livello alto.', fr: 'à un niveau haut.', de: 'zu einer hohen Ebene.',
      es: 'a un nivel alto.', ja: '高い段階へ。', pt: 'a um nível alto.',
    });
    expect(seed('TOO')?.definition).toBeUndefined();
  });

  // They are adverb concepts, so they ride the `role=adverb` fetch; `slot` is what keeps them out
  // of the verb's adverb picker, as `modal` keeps a modal out of the main-verb one.
  test('both name the slot they fill instead of a verb\'s', () => {
    expect(seed('VERY')?.slot).toBe('intensifier');
    expect(seed('TOO')?.slot).toBe('intensifier');
    expect(seed('REALLY')?.slot).toBeUndefined();
  });
});

// A248. An intensifier wraps the adjective's finished surface, degree included (`withIntensifier`),
// so VERY on a comparative writes the positive's intensifier in front of it: "very bigger", "très
// plus grand", "sehr größer", "muy más grande", とてももっと大きい. A comparative is intensified by
// a word of its own — "much bigger", "bien plus grand", "viel größer", "mucho más grande", ずっと大きい
// — which Italian and Portuguese happen to share with the positive ("molto più grande", "muito
// maior"). The lowered comparative has the same shape ("very less big" for "much less big").
describe('known bugs: an intensifier on a comparative (A248)', () => {
  const isBigger = (extra: Parameters<typeof np>[1] = {}) =>
    sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headIntensifier: 'VERY', ...extra }) } } }));

  test('a predicate comparative: much bigger', () => {
    expect(isBigger()).toEqual({
      en: 'the cat is much bigger.', it: 'il gatto è molto più grande.', fr: 'le chat est bien plus grand.',
      de: 'der Kater ist viel größer.', es: 'el gato es mucho más grande.', ja: '猫はずっと大きいです。',
      pt: 'o gato é muito maior.',
    });
  });

  // Japanese is left out here: the standard's より takes もっと's place, and comparison.test.ts pins
  // it (犬よりずっと大きい since the fix moved both).
  test('with a standard: much bigger than the dog', () => {
    expect(isBigger({ headStandard: np('DOG') })).toMatchObject({
      en: 'the cat is much bigger than the dog.', it: 'il gatto è molto più grande del cane.',
      fr: 'le chat est bien plus grand que le chien.', de: 'der Kater ist viel größer als der Hund.',
      es: 'el gato es mucho más grande que el perro.', pt: 'o gato é muito maior do que o cão.',
    });
  });

  test('an attributive comparative: a much bigger cat', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['VERY'], adjectiveDegrees: ['more'],
    }), 'RUN'))).toEqual({
      en: 'a much bigger cat runs.', it: 'un gatto molto più grande corre.', fr: 'un chat bien plus grand court.',
      de: 'ein viel größerer Kater läuft.', es: 'un gato mucho más grande corre.', ja: 'ずっと大きい猫は走ります。',
      pt: 'um gato muito maior corre.',
    });
  });

  test('the lowered comparative: much less big', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'less', headIntensifier: 'VERY' }) } } })))
      .toMatchObject({
        en: 'the cat is much less big.', it: 'il gatto è molto meno grande.', fr: 'le chat est bien moins grand.',
        de: 'der Kater ist viel weniger groß.', es: 'el gato es mucho menos grande.', pt: 'o gato é muito menos grande.',
      });
  });

  test('the attributive comparative agrees, and the intensifier still does not', () => {
    expect(sayAll(clause(np('HOUSE', {
      number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toEqual({
      en: 'much bigger houses run.', it: 'case molto più grandi corrono.', fr: 'des maisons bien plus grandes courent.',
      de: 'viel größere Häuser laufen.', es: 'unas casas mucho más grandes corren.', ja: 'ずっと大きい家は走ります。',
      pt: 'umas casas muito maiores correm.',
    });
  });

  test('the attributive lowered comparative and the lowered one with a standard', () => {
    expect(sayAll(clause(np('CAT', {
      definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['less'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toMatchObject({
      en: 'a much less big cat runs.', it: 'un gatto molto meno grande corre.', fr: 'un chat bien moins grand court.',
      de: 'ein viel weniger großer Kater läuft.', es: 'un gato mucho menos grande corre.', pt: 'um gato muito menos grande corre.',
    });
    expect(isBigger({ headDegree: 'less', headStandard: np('DOG') })).toMatchObject({
      en: 'the cat is much less big than the dog.', fr: 'le chat est bien moins grand que le chien.',
      de: 'der Kater ist viel weniger groß als der Hund.', es: 'el gato es mucho menos grande que el perro.',
    });
  });

  test('a comparative that inflects, and one under estar', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('HAPPY', { headDegree: 'more', headIntensifier: 'VERY' }) } } }))).toEqual({
      en: 'the cat is much happier.', it: 'il gatto è molto più felice.', fr: 'le chat est bien plus heureux.',
      de: 'der Kater ist viel glücklicher.', es: 'el gato está mucho más feliz.', ja: '猫はずっと幸せです。',
      pt: 'o gato está muito mais feliz.',
    });
  });

  // Japanese's lowered degree is a negation, not a comparative, so VERY does not turn to ずっと there; and TOO
  // does not turn into VERY's comparative word (it takes its own, "too much", A256).
  test('regression: Japanese lowered degree and TOO keep their positive word', () => {
    expect(isBigger({ headDegree: 'less' }).ja).not.toContain('ずっと');
    expect(isBigger({ headIntensifier: 'TOO' }).en).not.toBe('the cat is much bigger.');
  });

  test('regression: the positive keeps its intensifier', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headIntensifier: 'VERY' }) } } }))).toEqual({
      en: 'the cat is very big.', it: 'il gatto è molto grande.', fr: 'le chat est très grand.',
      de: 'der Kater ist sehr groß.', es: 'el gato es muy grande.', ja: '猫はとても大きいです。',
      pt: 'o gato é muito grande.',
    });
  });
});

const isBig = (extra: Parameters<typeof np>[1]) =>
  sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', extra) } } }));
const aBigCat = (degree: 'equally' | 'more' | 'less' | 'most', intensifier: string) =>
  sayAll(clause(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: [degree], adjectiveIntensifiers: [intensifier] }), 'RUN'));

// A255. VERY wraps the equative's finished surface as it wraps any degree (`withIntensifier`), so it
// stacks in front of it: "very equally big", "très aussi grand", "sehr gleich groß", "muy igual de
// grande", 犬と同じくらいとても大きい. Equality is not a scale VERY can raise; the emphasis it can add is
// exactness, which four languages say with a word of their own — *just as*, *tout aussi*, *genauso*,
// *altrettanto* — and the rest say with the equative alone (Spanish *igual de* already is "just as").
describe('known bugs: VERY on an equative (A255)', () => {
  test('a predicate equative: just as big', () => {
    expect(isBig({ headDegree: 'equally', headIntensifier: 'VERY' })).toEqual({
      en: 'the cat is just as big.', it: 'il gatto è altrettanto grande.', fr: 'le chat est tout aussi grand.',
      de: 'der Kater ist genauso groß.', es: 'el gato es igual de grande.', ja: '猫は同じくらい大きいです。',
      pt: 'o gato é igualmente grande.',
    });
  });

  test('with a standard: just as big as the dog', () => {
    expect(isBig({ headDegree: 'equally', headIntensifier: 'VERY', headStandard: np('DOG') })).toEqual({
      en: 'the cat is just as big as the dog.', it: 'il gatto è altrettanto grande quanto il cane.',
      fr: 'le chat est tout aussi grand que le chien.', de: 'der Kater ist genauso groß wie der Hund.',
      es: 'el gato es igual de grande que el perro.', ja: '猫は犬と同じくらい大きいです。',
      pt: 'o gato é tão grande como o cão.',
    });
  });

  // English does not put "just as" before a noun; the attributive equative keeps "equally" alone.
  test('an attributive equative: a cat just as big', () => {
    expect(aBigCat('equally', 'VERY')).toMatchObject({
      en: 'an equally big cat runs.', fr: 'un chat tout aussi grand court.',
      de: 'ein genauso großer Kater läuft.', es: 'un gato igual de grande corre.',
    });
  });

  test('the whole attributive equative, and its plural', () => {
    expect(aBigCat('equally', 'VERY')).toEqual({
      en: 'an equally big cat runs.', it: 'un gatto altrettanto grande corre.', fr: 'un chat tout aussi grand court.',
      de: 'ein genauso großer Kater läuft.', es: 'un gato igual de grande corre.', ja: '同じくらい大きい猫は走ります。',
      pt: 'um gato igualmente grande corre.',
    });
    expect(sayAll(clause(np('CAT', {
      number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['equally'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toEqual({
      en: 'equally big cats run.', it: 'gatti altrettanto grandi corrono.', fr: 'des chats tout aussi grands courent.',
      de: 'genauso große Kater laufen.', es: 'unos gatos igual de grandes corren.', ja: '同じくらい大きい猫は走ります。',
      pt: 'uns gatos igualmente grandes correm.',
    });
  });

  test('the adjective still agrees with the subject, and under estar', () => {
    expect(sayAll(clause(np('HOUSE', { number: 'plural' }), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'equally', headIntensifier: 'VERY' }) } },
    }))).toMatchObject({
      en: 'the houses are just as big.', it: 'le case sono altrettanto grandi.', fr: 'les maisons sont tout aussi grandes.',
      de: 'die Häuser sind genauso groß.', es: 'las casas son igual de grandes.', pt: 'as casas são igualmente grandes.',
    });
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np('HAPPY', { headDegree: 'equally', headIntensifier: 'VERY', headStandard: np('DOG') }) } },
    }))).toEqual({
      en: 'the cat is just as happy as the dog.', it: 'il gatto è altrettanto felice quanto il cane.',
      fr: 'le chat est tout aussi heureux que le chien.', de: 'der Kater ist genauso glücklich wie der Hund.',
      es: 'el gato está igual de feliz que el perro.', ja: '猫は犬と同じくらい幸せです。', pt: 'o gato está tão feliz como o cão.',
    });
  });

  test('regression: the bare equative', () => {
    expect(isBig({ headDegree: 'equally' })).toEqual({
      en: 'the cat is equally big.', it: 'il gatto è ugualmente grande.', fr: 'le chat est aussi grand.',
      de: 'der Kater ist gleich groß.', es: 'el gato es igual de grande.', ja: '猫は同じくらい大きいです。',
      pt: 'o gato é igualmente grande.',
    });
  });
});

// A256. TOO wraps the comparative's finished surface: "too bigger", "zu größer", "maior demais",
// もっと大きすぎる. TOO on a comparative says the difference is excessive — "too much bigger" — which is
// TOO on the comparative's own intensifier (A248's *much*, *viel*), not *much too big* (VERY on TOO on
// the positive, which drops the comparison). Italian and Spanish already say it ("troppo più grande",
// "demasiado más grande"); Portuguese takes the preposed *demasiado* a comparative allows; Japanese
// drops もっと under すぎる as the standard's より already makes it (犬より大きすぎる). French has no
// settled form ("trop plus grand" is colloquial at best) and is left out of the pin.
describe('known bugs: TOO on a comparative (A256)', () => {
  test('a predicate comparative: too much bigger', () => {
    expect(isBig({ headDegree: 'more', headIntensifier: 'TOO' })).toMatchObject({
      en: 'the cat is too much bigger.', de: 'der Kater ist zu viel größer.',
      ja: '猫は大きすぎます。', pt: 'o gato é demasiado maior.',
    });
  });

  test('with a standard, attributively, and lowered', () => {
    expect(isBig({ headDegree: 'more', headIntensifier: 'TOO', headStandard: np('DOG') })).toMatchObject({
      en: 'the cat is too much bigger than the dog.', de: 'der Kater ist zu viel größer als der Hund.',
      pt: 'o gato é demasiado maior do que o cão.',
    });
    expect(aBigCat('more', 'TOO')).toMatchObject({ de: 'ein zu viel größerer Kater läuft.', ja: '大きすぎる猫は走ります。' });
    expect(isBig({ headDegree: 'less', headIntensifier: 'TOO' })).toMatchObject({
      en: 'the cat is too much less big.', de: 'der Kater ist zu viel weniger groß.', pt: 'o gato é demasiado menos grande.',
    });
  });

  test('the whole predicate, attributive and with-a-standard comparative, French aside', () => {
    expect(isBig({ headDegree: 'more', headIntensifier: 'TOO' })).toMatchObject({
      en: 'the cat is too much bigger.', it: 'il gatto è troppo più grande.', de: 'der Kater ist zu viel größer.',
      es: 'el gato es demasiado más grande.', ja: '猫は大きすぎます。', pt: 'o gato é demasiado maior.',
    });
    expect(aBigCat('more', 'TOO')).toMatchObject({
      en: 'a too much bigger cat runs.', it: 'un gatto troppo più grande corre.', de: 'ein zu viel größerer Kater läuft.',
      es: 'un gato demasiado más grande corre.', ja: '大きすぎる猫は走ります。', pt: 'um gato demasiado maior corre.',
    });
    expect(isBig({ headDegree: 'less', headIntensifier: 'TOO', headStandard: np('DOG') })).toMatchObject({
      en: 'the cat is too much less big than the dog.', de: 'der Kater ist zu viel weniger groß als der Hund.',
      pt: 'o gato é demasiado menos grande do que o cão.',
    });
  });

  test('the comparative still agrees, and inflects, under the preposed demasiado', () => {
    expect(sayAll(clause(np('CAT', {
      number: 'plural', definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveIntensifiers: ['TOO'],
    }), 'RUN'))).toMatchObject({
      en: 'too much bigger cats run.', de: 'zu viel größere Kater laufen.', pt: 'uns gatos demasiado maiores correm.',
    });
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('HAPPY', { headDegree: 'more', headIntensifier: 'TOO' }) } } }))).toMatchObject({
      en: 'the cat is too much happier.', de: 'der Kater ist zu viel glücklicher.', ja: '猫は幸せすぎます。',
      pt: 'o gato está demasiado mais feliz.',
    });
  });

  // The Japanese lowered degree is a negation (それほど大きくない), not a comparative, so もっと's rule
  // does not reach it and 〜すぎる negates with the adjective as before.
  test('regression: the Japanese lowered degree keeps its adverb under すぎる', () => {
    expect(isBig({ headDegree: 'less', headIntensifier: 'TOO' }).ja).toBe('猫はそれほど大きすぎないです。');
  });

  test('regression: Italian, Spanish and the Japanese standard already say it', () => {
    expect(isBig({ headDegree: 'more', headIntensifier: 'TOO' })).toMatchObject({
      it: 'il gatto è troppo più grande.', es: 'el gato es demasiado más grande.',
    });
    expect(isBig({ headDegree: 'more', headIntensifier: 'TOO', headStandard: np('DOG') }).ja).toBe('猫は犬より大きすぎます。');
  });
});

// A257. VERY wraps the superlative's finished surface: "the cat is very biggest", "il molto più
// grande", "el muy más grande", "le très plus grand", "sehr am größten", とても最も大きい. A superlative is
// intensified by a phrase of its own that stands outside the article: *by far*, *di gran lunga*,
// *de loin*, *bei weitem*, *con mucho*, *de longe*, 断然. English attributive "the very biggest cat" is
// the one place VERY itself is right, after the article, and is already what the engine writes.
describe('known bugs: VERY on a superlative (A257)', () => {
  test('a predicate superlative: by far the biggest', () => {
    expect(isBig({ headDegree: 'most', headIntensifier: 'VERY' })).toEqual({
      en: 'the cat is by far the biggest.', it: 'il gatto è di gran lunga il più grande.',
      fr: 'le chat est de loin le plus grand.', de: 'der Kater ist bei weitem am größten.',
      es: 'el gato es con mucho el más grande.', ja: '猫は断然最も大きいです。', pt: 'o gato é de longe o maior.',
    });
  });

  test('the lowered superlative: by far the least big', () => {
    expect(isBig({ headDegree: 'least', headIntensifier: 'VERY' })).toMatchObject({
      en: 'the cat is by far the least big.', it: 'il gatto è di gran lunga il meno grande.',
      fr: 'le chat est de loin le moins grand.', de: 'der Kater ist bei weitem am wenigsten groß.',
      es: 'el gato es con mucho el menos grande.', pt: 'o gato é de longe o menos grande.',
    });
  });

  test('an attributive superlative: der bei weitem größte Kater', () => {
    expect(aBigCat('most', 'VERY')).toMatchObject({
      de: 'der bei weitem größte Kater läuft.', fr: 'le chat de loin le plus grand court.',
    });
  });

  test('the subject\'s agreement, an inflecting superlative and a suppletive one', () => {
    expect(sayAll(clause(np('HOUSE', { number: 'plural' }), 'BE', {
      complements: { predicative: { phrase: np('BIG', { headDegree: 'most', headIntensifier: 'VERY' }) } },
    }))).toEqual({
      en: 'the houses are by far the biggest.', it: 'le case sono di gran lunga le più grandi.',
      fr: 'les maisons sont de loin les plus grandes.', de: 'die Häuser sind bei weitem am größten.',
      es: 'las casas son con mucho las más grandes.', ja: '家は断然最も大きいです。', pt: 'as casas são de longe as maiores.',
    });
    const most = (adjective: string) => sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: np(adjective, { headDegree: 'most', headIntensifier: 'VERY' }) } },
    }));
    expect(most('HAPPY')).toEqual({
      en: 'the cat is by far the happiest.', it: 'il gatto è di gran lunga il più felice.',
      fr: 'le chat est de loin le plus heureux.', de: 'der Kater ist bei weitem am glücklichsten.',
      es: 'el gato está con mucho el más feliz.', ja: '猫は断然最も幸せです。', pt: 'o gato está de longe o mais feliz.',
    });
    expect(most('GOOD')).toMatchObject({
      en: 'the cat is by far the best.', fr: 'le chat est de loin le meilleur.',
      de: 'der Kater ist bei weitem am besten.', pt: 'o gato é de longe o melhor.',
    });
  });

  test('the attributive superlative, plural and lowered', () => {
    expect(sayAll(clause(np('HOUSE', {
      number: 'plural', adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'))).toMatchObject({
      en: 'the very biggest houses run.', fr: 'les maisons de loin les plus grandes courent.',
      de: 'die bei weitem größten Häuser laufen.', ja: '断然最も大きい家は走ります。',
    });
    expect(sayAll(clause(np('CAT', { adjectives: ['BIG'], adjectiveDegrees: ['least'], adjectiveIntensifiers: ['VERY'] }), 'RUN'))).toMatchObject({
      en: 'the very least big cat runs.', fr: 'le chat de loin le moins grand court.',
      de: 'der bei weitem am wenigsten große Kater läuft.',
    });
  });

  test('regression: English attributive VERY after the article is right', () => {
    expect(aBigCat('most', 'VERY').en).toBe('the very biggest cat runs.');
  });
});

// A258. Japanese's lowered degree is a negated positive (それほど大きくない, 犬ほど大きくない), and VERY
// leads it as it leads any degree (`jaDegreeSegs`): とてもそれほど大きくない, 犬ほどとても大きくない.
// An adverb inside the negation reads "not very" (とても大きくない), so とても there says the opposite
// of "much less big"; Japanese has no intensifier that scopes over the lowering, and the lowered degree
// alone is the closest rendering — as it is for a comparative, where A248 made VERY ずっと and so the
// fix drops とても here, not the degree.
describe('known bugs: Japanese VERY on a lowered degree (A258)', () => {
  test('bare, with a standard, and attributive: VERY is dropped', () => {
    expect(isBig({ headDegree: 'less', headIntensifier: 'VERY' }).ja).toBe('猫はそれほど大きくないです。');
    expect(isBig({ headDegree: 'less', headIntensifier: 'VERY', headStandard: np('DOG') }).ja).toBe('猫は犬ほど大きくないです。');
    expect(aBigCat('less', 'VERY').ja).toBe('それほど大きくない猫は走ります。');
  });

  test('other adjective classes, the past, the negated clause and the plural attributive', () => {
    const ja = (adjective: string, verbPhrase = {}) => say(clause(np('CAT'), 'BE', {
      verbPhrase, complements: { predicative: { phrase: np(adjective, { headDegree: 'less', headIntensifier: 'VERY' }) } },
    }), 'ja');
    expect(ja('HAPPY')).toBe('猫はそれほど幸せではないです。');
    expect(ja('BIG', { tense: 'past' })).toBe('猫はそれほど大きくなかったです。');
    expect(ja('BIG', { negative: true })).toBe('猫はそれほど大きくないわけではありません。');
    expect(say(clause(np('HOUSE', {
      number: 'plural', definiteness: 'indefinite', adjectives: ['HAPPY'], adjectiveDegrees: ['less'], adjectiveIntensifiers: ['VERY'],
    }), 'RUN'), 'ja')).toBe('それほど幸せではない家は走ります。');
  });

  test('regression: the other six say much less big, and VERY on the positive keeps とても', () => {
    expect(isBig({ headDegree: 'less', headIntensifier: 'VERY' })).toMatchObject({
      en: 'the cat is much less big.', de: 'der Kater ist viel weniger groß.', fr: 'le chat est bien moins grand.',
    });
    expect(isBig({ headIntensifier: 'VERY' }).ja).toBe('猫はとても大きいです。');
  });
});
