import { describe, expect, test } from 'vitest';
import type { Degree, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';
import { concepts } from '../../../backend/src/concepts/index.js';

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

  // Romance used to render a PREDICATIVE superlative identically to the comparative:
  //
  //     more   "il gatto sembra più felice."     most   "il gatto sembra più felice."
  //
  // That collapsed the two, unlike the legitimate homophony of the attributive case, where the
  // noun's own definite article does the superlative's work ("il gatto più grande" — see
  // nounPhrase.test.ts). A predicate adjective has no article to borrow, so the superlative now
  // supplies its own: "sembra IL più felice", "semble LE plus heureux".
  //
  // German proves the distinction is real by getting it right ("am glücklichsten" vs
  // "glücklicher"), as does English ("happiest" vs "happier").
  test('Italian predicative superlative supplies its own article: "il più felice"', () => {
    expect(atDegree('most')).toMatchObject({ it: 'il gatto sembra il più felice.' });
  });

  test('French predicative superlative supplies its own article: "le plus heureux"', () => {
    expect(atDegree('most')).toMatchObject({ fr: 'le chat semble le plus heureux.' });
  });

  test('Spanish predicative superlative supplies its own article: "el más feliz"', () => {
    expect(atDegree('most')).toMatchObject({ es: 'el gato parece el más feliz.' });
  });

  test('…and the same for the lowered superlative, "least"', () => {
    expect(atDegree('least')).toMatchObject({ it: 'il gatto sembra il meno felice.' });
  });

  test('Romance "most" must not be word-for-word identical to "more"', () => {
    expect(atDegree('most').it).not.toBe(atDegree('more').it);
  });

  // Portuguese completes the Romance set (not asserted above): "o mais feliz" / "o menos feliz".
  test('Portuguese predicative superlative supplies its own article too', () => {
    expect(atDegree('most').pt).toBe('o gato parece o mais feliz.');
    expect(atDegree('least').pt).toBe('o gato parece o menos feliz.');
  });

  // The lowered superlative "least" carries the article in French and Spanish as well as Italian.
  test('the lowered superlative takes the article across Romance', () => {
    expect(atDegree('least').fr).toBe('le chat semble le moins heureux.');
    expect(atDegree('least').es).toBe('el gato parece el menos feliz.');
  });

  // The supplied article agrees with the subject in gender, alongside the adjective: a feminine
  // subject gives "la … più/plus/más felice/heureuse/feliz", "a … mais feliz".
  test('the predicative superlative article agrees with a feminine subject', () => {
    const fem = seems(np('HAPPY', { headDegree: 'most' }), np('CAT', { gender: 'fem' }));
    expect(fem).toMatchObject({
      it: 'la gatta sembra la più felice.',
      fr: 'la chatte semble la plus heureuse.',
      es: 'la gata parece la más feliz.',
      pt: 'a gata parece a mais feliz.',
    });
  });

  // …and in number: a plural subject gives the plural article and the plural adjective.
  test('the predicative superlative article agrees with a plural subject', () => {
    const pl = seems(np('HAPPY', { headDegree: 'most' }), np('CAT', { number: 'plural' }));
    expect(pl).toMatchObject({
      it: 'i gatti sembrano i più felici.',
      es: 'los gatos parecen los más felices.',
    });
  });

  // Regression: the COMPARATIVE (more/less) still takes no article — only the superlative does.
  test('the comparative predicative takes no article', () => {
    expect(atDegree('more')).toMatchObject({
      it: 'il gatto sembra più felice.',
      fr: 'le chat semble plus heureux.',
      es: 'el gato parece más feliz.',
      pt: 'o gato parece mais feliz.',
    });
  });

  // Japanese renders LEAST as 最も — which means MOST. The two degrees come out byte-identical,
  // so "the cat seems LEAST happy" is rendered "the cat seems MOST happy": the meaning inverts.
  // (A lowered superlative wants 最も〜ない / 一番〜ない — a negated form.)
  test('Japanese "least" must not render as 最も ("most")', () => {
    expect(atDegree('least').ja).not.toBe(atDegree('most').ja);
  });

  // And "less" reuses あまり, which is a negative-polarity adverb: あまり幸せ is ungrammatical
  // without a negated predicate (あまり幸せではない). Same defect as the attributive case.
  test('Japanese "less" should not use あまり with an affirmative predicate', () => {
    expect(atDegree('less').ja).not.toContain('あまり');
  });

  // The concrete predicative forms. Through 見える/思える the negated adjective takes the adverbial
  // (幸せではなく); the raised degrees stay affirmative (幸せに). The lowering adverbs are 最も…
  // ("least") and それほど… ("less").
  test('Japanese renders the lowered predicative degrees as the negated adjective', () => {
    expect(atDegree('least').ja).toBe('猫は最も幸せではなく思えます。');
    expect(atDegree('less').ja).toBe('猫はそれほど幸せではなく思えます。');
    expect(atDegree('most').ja).toBe('猫は最も幸せに思えます。'); // regression: raised is affirmative
  });

  // The copula (BE) predicate reaches the same negation the other way: an i-adjective's negative
  // inflects its own copula (大きくないです), so "is least/less big" is 最も/それほど大きくないです.
  test('Japanese lowers a copula predicate adjective by negating it (大きくないです)', () => {
    const isBig = (d: Degree) =>
      sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: d }) } } })).ja;
    expect(isBig('least')).toBe('猫は最も大きくないです。');
    expect(isBig('less')).toBe('猫はそれほど大きくないです。');
    expect(isBig('most')).toBe('猫は最も大きいです。'); // regression: raised is affirmative
  });
});

// The subject complement belongs to the SEEMING verb, not to the coming-into-view one. APPEAR
// means "to come into view" (its opposite is disappearing) and says nothing about what the
// subject is like, so it licenses no `predicative` — the slot the builder would otherwise offer
// produced "*il gatto appare una leggenda" / "*der Kater erscheint eine Legende", ill-formed in
// every language whose APPEAR lexeme is the come-into-view verb. SEEM carries that sense instead.
describe('predicative is licensed by SEEM, not by APPEAR', () => {
  const licenses = (verb: string) =>
    concepts.find((c) => c.id === verb)?.complements?.includes('predicative') ?? false;

  test('SEEM licenses a subject complement; APPEAR does not', () => {
    expect(licenses('SEEM')).toBe(true);
    expect(licenses('APPEAR')).toBe(false);
    // The other copular verbs are unaffected — they are what the complement was built for.
    expect(licenses('BECOME')).toBe(true);
    expect(licenses('BE')).toBe(true);
  });
});

// A46. The `predicative` renderer branches on the COMPLEMENT head (adjective vs noun) but never
// on the VERB. That is right for BECOME and BE, where every language takes a bare predicate
// nominative ("becomes a legend", "wird eine Legende"), and it is what SEEM inherits — but the
// seeming verb does not license a bare predicate noun on the same terms in English or German.
// A predicate ADJECTIVE is fine under all three verbs; only the nominal complement is affected.
describe('known bugs: a predicate NOUN under SEEM', () => {
  // English "seems a legend" is archaic/literary; the modern form raises an infinitival copula.
  // German `scheinen` cannot take a predicate nominative at all — it needs "… zu sein".
  // Romance is already correct: sembrare/sembler/parecer do license a bare predicate noun.
  test.fails('SEEM + a predicate noun needs an infinitival copula in English and German', () => {
    expect(seems(legend())).toMatchObject({
      en: 'the cat seems to be a legend.',
      de: 'der Kater scheint eine Legende zu sein.',
      it: 'il gatto sembra una leggenda.', // regression: Romance is already right
      es: 'el gato parece una leyenda.',
    });
  });
});

// A47, the predicative half. Unlike the locative — where a place is always `estar` — a predicate
// complement splits on WHAT IS ASCRIBED, so the corpus has to say which is which:
//   · a predicate NOUN is always `ser` ("es una leyenda") — already correct, pinned as a regression
//   · an INHERENT property is `ser` ("es grande") — already correct
//   · a TRANSIENT state is `estar` ("está cansado") — wrong today, the engine says "es cansado"
describe('known bugs: Spanish/Portuguese ser vs estar in a predicative', () => {
  const isThat = (adjective: string) =>
    sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np(adjective) } } }));

  test.fails('a transient state takes estar, not ser', () => {
    expect(isThat('TIRED')).toMatchObject({
      es: 'el gato está cansado.',
      pt: 'o gato está cansado.',
    });
  });

  test('regression: an inherent property and a predicate noun keep ser', () => {
    expect(isThat('BIG')).toMatchObject({ es: 'el gato es grande.', pt: 'o gato é grande.' });
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: legend() } } })))
      .toMatchObject({ es: 'el gato es una leyenda.', pt: 'o gato é uma lenda.' });
  });
});
