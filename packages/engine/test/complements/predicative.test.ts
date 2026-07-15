import { describe, expect, test } from 'vitest';
import type { Degree, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The subject complement — what the subject *is* or *becomes*, rather than what it acts on. It is
// the one complement whose head may be an ADJECTIVE (a predicate adjective, "seems happy") as
// well as a noun (a predicate nominative, "becomes a legend").
const becomes = (phrase: NounPhrase) =>
  sayAll(clause(np('CAT'), 'BECOME', { complements: { predicative: { phrase } } }));

const seems = (phrase: NounPhrase, subject: NounPhrase = np('CAT')) =>
  sayAll(clause(subject, 'SEEM', { complements: { predicative: { phrase } } }));

const legend = (extra: Partial<NounPhrase> = {}) =>
  np('LEGEND', { definiteness: 'indefinite', ...extra });

describe('predicative', () => {
  test('a predicate noun', () => {
    expect(becomes(legend())).toMatchObject({
      en: 'the cat becomes a legend.',
      it: 'il gatto diventa una leggenda.',
      es: 'el gato se vuelve una leyenda.', // a reflexive verb in Spanish
      de: 'der Kater wird eine Legende.',
      ja: '猫は伝説になります。', // になる
    });
  });

  test('a predicate adjective agrees with the SUBJECT, not with a head of its own', () => {
    expect(seems(np('HAPPY'), np('CAT', { gender: 'fem' }))).toMatchObject({
      it: 'la gatta sembra felice.',
      fr: 'la chatte semble heureuse.', // heureux → heureuse, agreeing with the subject
      // German predicate adjectives are uninflected — no agreement, unlike attributive ones.
      de: 'die Katze scheint glücklich.',
    });
  });
});

// The predicative phrase is a full noun phrase, so it can carry a relative clause of its own —
// and the predicate noun may fill either slot of that clause.
describe('predicative: a predicate noun with a subordinate clause', () => {
  test('the predicate noun is the SUBJECT of its clause', () => {
    expect(becomes(legend({ relative: { verbPhrase: { verb: 'BURN' } } }))).toEqual({
      en: 'the cat becomes a legend that burns.',
      it: 'il gatto diventa una leggenda che brucia.',
      fr: 'le chat devient une légende qui brûle.', // qui — the subject relativiser
      es: 'el gato se vuelve una leyenda que arde.',
      pt: 'o gato se torna uma lenda que arde.',
      // German closes the clause correctly HERE, because it ends the sentence — the missing
      // closing comma only shows when the matrix clause continues afterwards.
      de: 'der Kater wird eine Legende, die brennt.',
      ja: '猫は燃える伝説になります。', // plain form inside the relative clause (燃える, not 燃えます)
    });
  });

  test('…and that clause may carry an object of its own', () => {
    expect(becomes(legend({
      relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') },
    }))).toMatchObject({
      en: 'the cat becomes a legend that eats the mouse.',
      it: 'il gatto diventa una leggenda che mangia il topo.',
      de: 'der Kater wird eine Legende, die die Maus isst.', // verb-final inside the clause
    });
  });

  test('the predicate noun is the OBJECT of its clause', () => {
    expect(becomes(legend({
      relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb: 'READ' } },
    }))).toEqual({
      en: 'the cat becomes a legend that the dog reads.',
      it: 'il gatto diventa una leggenda che il cane legge.',
      fr: 'le chat devient une légende que le chien lit.', // que, not qui — the object relativiser
      es: 'el gato se vuelve una leyenda que el perro lee.',
      pt: 'o gato se torna uma lenda que o cão lê.',
      de: 'der Kater wird eine Legende, die der Hund liest.',
      ja: '猫は犬が読む伝説になります。', // the clause's own subject leads (が); plain form 読む, not 読みます
    });
  });

  test('…and that clause keeps its own tense', () => {
    expect(becomes(legend({
      relative: {
        headRole: 'directObject',
        subject: np('DOG'),
        verbPhrase: { verb: 'READ', tense: 'past' },
      },
    }))).toMatchObject({
      en: 'the cat becomes a legend that the dog read.',
      it: 'il gatto diventa una leggenda che il cane lesse.',
      fr: 'le chat devient une légende que le chien lut.',
      de: 'der Kater wird eine Legende, die der Hund las.',
    });
  });
});

// A predicate adjective is the HEAD of its phrase — the one place an adjective heads a noun
// phrase — so its degree comes from `headDegree`, not from `adjectiveDegrees`.
describe('predicative: a predicate adjective at every degree', () => {
  const atDegree = (headDegree: Degree) => seems(np('HAPPY', { headDegree }));

  test('positive — the plain form', () => {
    expect(atDegree('positive')).toEqual({
      en: 'the cat seems happy.',
      it: 'il gatto sembra felice.',
      fr: 'le chat semble heureux.',
      es: 'el gato parece feliz.',
      pt: 'o gato parece feliz.',
      de: 'der Kater scheint glücklich.',
      ja: '猫は幸せに思えます。',
    });
  });

  test('more — the comparative', () => {
    expect(atDegree('more')).toEqual({
      en: 'the cat seems happier.', // English inflects a short adjective
      it: 'il gatto sembra più felice.',
      fr: 'le chat semble plus heureux.',
      es: 'el gato parece más feliz.',
      pt: 'o gato parece mais feliz.',
      de: 'der Kater scheint glücklicher.', // German inflects too
      ja: '猫はもっと幸せに思えます。',
    });
  });

  test('most — the superlative', () => {
    expect(atDegree('most')).toMatchObject({
      en: 'the cat seems happiest.',
      // German has a dedicated predicative superlative: "am …sten", not the attributive "der …ste".
      de: 'der Kater scheint am glücklichsten.',
      ja: '猫は最も幸せに思えます。',
    });
  });

  test('less', () => {
    expect(atDegree('less')).toMatchObject({
      en: 'the cat seems less happy.',
      it: 'il gatto sembra meno felice.',
      fr: 'le chat semble moins heureux.',
      es: 'el gato parece menos feliz.',
      de: 'der Kater scheint weniger glücklich.',
    });
  });

  test('least', () => {
    expect(atDegree('least')).toMatchObject({
      en: 'the cat seems least happy.',
      de: 'der Kater scheint am wenigsten glücklich.', // the "am …" form again
    });
  });

  test('equally', () => {
    expect(atDegree('equally')).toEqual({
      en: 'the cat seems equally happy.',
      it: 'il gatto sembra ugualmente felice.',
      fr: 'le chat semble aussi heureux.',
      es: 'el gato parece igual de feliz.',
      pt: 'o gato parece igualmente feliz.',
      de: 'der Kater scheint gleich glücklich.',
      ja: '猫は同じくらい幸せに思えます。',
    });
  });

  test('the degree does not disturb the agreement with the subject', () => {
    expect(seems(np('HAPPY', { headDegree: 'more' }), np('CAT', { gender: 'fem' })))
      .toMatchObject({
        it: 'la gatta sembra più felice.',
        fr: 'la chatte semble plus heureuse.', // heureuse AND plus, together
        es: 'la gata parece más feliz.',
      });
  });
});

describe('known bugs: predicative degree', () => {
  const atDegree = (headDegree: Degree) => seems(np('HAPPY', { headDegree }));

  // Romance renders a PREDICATIVE superlative identically to the comparative:
  //
  //     more   "il gatto sembra più felice."     most   "il gatto sembra più felice."
  //
  // This is NOT the legitimate homophony of the attributive case. There, the noun's own definite
  // article does the superlative's work ("il gatto più grande" — see nounPhrase.test.ts), so the
  // two genuinely coincide. A predicate adjective has no article to borrow, so the superlative
  // must supply its own: "sembra IL più felice", "semble LE plus heureux". Without it, "most"
  // simply says "more".
  //
  // German proves the distinction is real by getting it right ("am glücklichsten" vs
  // "glücklicher"), as does English ("happiest" vs "happier").
  test.fails('Italian predicative superlative needs its own article: "il più felice"', () => {
    expect(atDegree('most')).toMatchObject({ it: 'il gatto sembra il più felice.' });
  });

  test.fails('French predicative superlative needs its own article: "le plus heureux"', () => {
    expect(atDegree('most')).toMatchObject({ fr: 'le chat semble le plus heureux.' });
  });

  test.fails('Spanish predicative superlative needs its own article: "el más feliz"', () => {
    expect(atDegree('most')).toMatchObject({ es: 'el gato parece el más feliz.' });
  });

  test.fails('…and the same for the lowered superlative, "least"', () => {
    expect(atDegree('least')).toMatchObject({ it: 'il gatto sembra il meno felice.' });
  });

  test.fails('Romance "most" must not be word-for-word identical to "more"', () => {
    expect(atDegree('most').it).not.toBe(atDegree('more').it);
  });

  // Japanese renders LEAST as 最も — which means MOST. The two degrees come out byte-identical,
  // so "the cat seems LEAST happy" is rendered "the cat seems MOST happy": the meaning inverts.
  // (A lowered superlative wants 最も〜ない / 一番〜ない — a negated form.)
  test.fails('Japanese "least" must not render as 最も ("most")', () => {
    expect(atDegree('least').ja).not.toBe(atDegree('most').ja);
  });

  // And "less" reuses あまり, which is a negative-polarity adverb: あまり幸せ is ungrammatical
  // without a negated predicate (あまり幸せではない). Same defect as the attributive case.
  test.fails('Japanese "less" should not use あまり with an affirmative predicate', () => {
    expect(atDegree('less').ja).not.toContain('あまり');
  });
});
