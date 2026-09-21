import { describe, expect, test } from 'vitest';
import type { Degree, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';
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
  test('SEEM + a predicate noun needs an infinitival copula in English and German', () => {
    expect(seems(legend())).toMatchObject({
      en: 'the cat seems to be a legend.',
      de: 'der Kater scheint eine Legende zu sein.',
      it: 'il gatto sembra una leggenda.', // regression: Romance is already right
      es: 'el gato parece una leyenda.',
    });
  });

  const seemsIn = (verbPhrase: Partial<VerbPhrase>, plan: Partial<PhrasePlan> = {}, subject: NounPhrase = np('CAT')) =>
    sayAll({ ...clause(subject, 'SEEM', { verbPhrase, complements: { predicative: { phrase: legend() } } }), ...plan });

  // The copula rides along with the verb group: English puts it after whatever carries tense,
  // negation or the modal; German closes the Mittelfeld with it, against the non-finite tail.
  test('the infinitival copula holds across tense, negation and modals', () => {
    expect(seemsIn({ tense: 'past' })).toMatchObject({
      en: 'the cat seemed to be a legend.',
      de: 'der Kater schien eine Legende zu sein.',
      it: 'il gatto sembrava una leggenda.',
    });
    expect(seemsIn({ negative: true })).toMatchObject({
      en: 'the cat does not seem to be a legend.',
      de: 'der Kater scheint nicht eine Legende zu sein.',
      fr: 'le chat ne semble pas une légende.',
    });
    expect(seemsIn({ tense: 'future' })).toMatchObject({
      en: 'the cat will seem to be a legend.',
      de: 'der Kater wird eine Legende zu sein scheinen.', // "zu sein" before the clause-final infinitive
    });
    expect(seemsIn({ modals: ['CAN'] })).toMatchObject({
      en: 'the cat can seem to be a legend.',
      de: 'der Kater kann eine Legende zu sein scheinen.',
    });
    expect(seemsIn({ aspect: 'resultative' })).toMatchObject({
      en: 'the cat has seemed to be a legend.',
      de: 'der Kater hat eine Legende zu sein geschienen.',
    });
    expect(seemsIn({ modifier: 'ALWAYS' })).toMatchObject({
      en: 'the cat always seems to be a legend.',
      de: 'der Kater scheint immer eine Legende zu sein.',
    });
  });

  test('the infinitival copula holds in the moods and in verb-final clauses', () => {
    expect(seemsIn({}, { imperative: true }, np('SECOND_PERSON'))).toMatchObject({
      en: 'seem to be a legend.',
      de: 'schein eine Legende zu sein.',
      it: 'sembra una leggenda.',
    });
    expect(seemsIn({}, { infinitive: true }, np('GENERIC_PERSON'))).toMatchObject({
      en: 'to seem to be a legend.',
      de: 'eine Legende zu sein scheinen.',
      it: 'sembrare una leggenda.',
    });
    // The "wenn" protasis is verb-final, so "zu sein" lands before the finite "würde".
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: legend() } } }) }))
      .toMatchObject({
        en: 'if the cat seemed to be a legend, the dog would run.',
        de: 'wenn der Kater eine Legende zu sein scheinen würde, würde der Hund laufen.',
        it: 'se il gatto sembrasse una leggenda, il cane correrebbe.',
      });
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEEM' }, complements: { predicative: { phrase: legend() } } } }), 'EAT')))
      .toMatchObject({
        en: 'the dog that seems to be a legend eats.',
        de: 'der Hund, der eine Legende zu sein scheint, frisst.',
        it: 'il cane che sembra una leggenda mangia.',
      });
  });

  // German closes every complement before "zu sein"; English keeps "to be" on the predicate. A
  // relative clause on the predicate noun is bracketed by its commas ahead of "zu sein".
  test('the infinitival copula with other complements and a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: legend() }, locative: { phrase: np('MARKET') } } })))
      .toMatchObject({
        en: 'the cat seems to be a legend in the market.',
        de: 'der Kater scheint eine Legende im Markt zu sein.',
      });
    expect(sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: legend() }, terminus: { phrase: np('DOG') } } })))
      .toMatchObject({
        en: 'the cat seems to be a legend to the dog.',
        de: 'der Kater scheint dem Hund eine Legende zu sein.', // the dative recipient leads
      });
    expect(seems(legend({ relative: { verbPhrase: { verb: 'BURN' } } }))).toMatchObject({
      en: 'the cat seems to be a legend that burns.',
      de: 'der Kater scheint eine Legende, die brennt, zu sein.',
      fr: 'le chat semble une légende qui brûle.',
    });
  });

  // One noun conjunct is enough: the copula then carries the whole group.
  test('a coordination holding a predicate noun takes the copula once, for the group', () => {
    const seemsGroup = (...conjuncts: NounPhrase[]) =>
      sayAll(clause(np('CAT'), 'SEEM', { complements: { predicative: { phrase: { conjuncts, conjunction: 'and' } } } }));
    expect(seemsGroup(np('TIRED'), legend())).toMatchObject({
      en: 'the cat seems to be tired and a legend.',
      de: 'der Kater scheint müde und eine Legende zu sein.',
      it: 'il gatto sembra stanco e una leggenda.',
    });
    expect(seemsGroup(legend(), np('DOG', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat seems to be a legend and a dog.',
      de: 'der Kater scheint eine Legende und ein Hund zu sein.',
    });
  });

  // Regression guards: the repair keys off the seeming verb AND a noun complement. A predicate
  // adjective under SEEM stays bare, and BECOME/BE keep their bare predicate nominative.
  test('a predicate adjective under SEEM and a predicate noun under BECOME or BE stay bare', () => {
    expect(seems(np('TIRED'))).toMatchObject({ en: 'the cat seems tired.', de: 'der Kater scheint müde.' });
    expect(sayAll(clause(np('CAT'), 'SEEM', { verbPhrase: { negative: true }, complements: { predicative: { phrase: np('TIRED') } } })))
      .toMatchObject({ en: 'the cat does not seem tired.', de: 'der Kater scheint nicht müde.' });
    expect(becomes(legend())).toMatchObject({ en: 'the cat becomes a legend.', de: 'der Kater wird eine Legende.' });
    expect(sayAll(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: legend() } } })))
      .toMatchObject({ en: 'the cat is a legend.', de: 'der Kater ist eine Legende.' });
  });

  // Japanese and Romance license the bare predicate noun under their seeming verb, so the corpus
  // flag changes nothing there.
  test('the other languages keep the bare predicate noun under SEEM', () => {
    expect(seems(legend())).toMatchObject({
      it: 'il gatto sembra una leggenda.',
      fr: 'le chat semble une légende.',
      es: 'el gato parece una leyenda.',
      pt: 'o gato parece uma lenda.',
      ja: '猫は伝説に思えます。',
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

  test('a transient state takes estar, not ser', () => {
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

  // The transient reading covers the whole marked class, not just cansado: physical states,
  // emotions, and resultant-state participles all predicate with estar.
  test('other transient states also take estar', () => {
    expect(isThat('HUNGRY')).toMatchObject({ es: 'el gato está hambriento.', pt: 'o gato está faminto.' });
    expect(isThat('COLD')).toMatchObject({ es: 'el gato está frío.', pt: 'o gato está frio.' });
    // Resultant-state participles — "the file is saved / written" → está guardado / escrito.
    expect(isThat('SAVED')).toMatchObject({ es: 'el gato está guardado.', pt: 'o gato está salvo.' });
    expect(isThat('WRITTEN')).toMatchObject({ es: 'el gato está escrito.', pt: 'o gato está escrito.' });
    // A state something is *put into*, which is what TIDY_UP's gloss causes (localization C19).
    expect(isThat('TIDY')).toMatchObject({ es: 'el gato está ordenado.', pt: 'o gato está arrumado.' });
  });

  // The product call for the both-copula adjectives: emotions take the transient reading
  // (está feliz / triste), age keeps the inherent one (es viejo / é velho). One boolean per
  // adjective, so the alternate reading (ser feliz "a happy person"; estar viejo "looking aged")
  // is the documented loss.
  test('emotions read as transient (estar); age reads as inherent (ser)', () => {
    expect(isThat('HAPPY')).toMatchObject({ es: 'el gato está feliz.', pt: 'o gato está feliz.' });
    expect(isThat('SAD')).toMatchObject({ es: 'el gato está triste.', pt: 'o gato está triste.' });
    expect(isThat('OLD')).toMatchObject({ es: 'el gato es viejo.', pt: 'o gato é velho.' });
    expect(isThat('YOUNG')).toMatchObject({ es: 'el gato es joven.', pt: 'o gato é jovem.' });
  });

  // Regression: an unmarked inherent adjective keeps ser, and the estar switch is BE-only —
  // BECOME (se vuelve / torna-se) never routes through it, transient adjective or not.
  test('an inherent adjective keeps ser; BECOME is untouched by the split', () => {
    expect(isThat('BEAUTIFUL')).toMatchObject({ es: 'el gato es hermoso.', pt: 'o gato é belo.' });
    expect(sayAll(clause(np('CAT'), 'BECOME', { complements: { predicative: { phrase: np('TIRED') } } })))
      .toMatchObject({ es: 'el gato se vuelve cansado.', pt: 'o gato se torna cansado.' });
  });
});

// A66. A47's ser/estar choice is made only for the plain finite copula in `predicateText`. The
// modal infinitive, the imperative, the instruction/citation infinitive and the ter + participle
// (and its present-tense preterite) all read the seeded BE, so a place or a transient state gets
// "ser" there: "deve ser cansado", "seja na casa", "tinha sido na casa".
describe('known bugs: Portuguese ser vs estar outside the finite copula', () => {
  const tired = { predicative: { phrase: np('TIRED') } };
  const atHome = { locative: { phrase: np('HOUSE') } };

  test('Portuguese selects estar under a modal, a command, an infinitive and ter', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: tired, verbPhrase: { modals: ['MUST'] } })).pt).toBe('o gato deve estar cansado.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: atHome, verbPhrase: { modals: ['MUST'] } })).pt).toBe('o gato deve estar na casa.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE', { complements: atHome }), imperative: true }).pt).toBe('esteja na casa.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE', { complements: tired, verbPhrase: { negative: true } }), imperative: true }).pt).toBe('não esteja cansado.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'BE', { complements: atHome }), infinitive: true }).pt).toBe('estar na casa.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE', { complements: tired }), imperative: true, imperativeRegister: 'instruction' }).pt).toBe('estar cansado.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: atHome, verbPhrase: { aspect: 'resultative' } })).pt).toBe('o gato esteve na casa.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: tired, verbPhrase: { tense: 'past', aspect: 'resultative' } })).pt).toBe('o gato tinha estado cansado.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: atHome, verbPhrase: { modals: ['MUST'], aspect: 'resultative' } })).pt).toBe('o gato deve ter estado na casa.');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'BE', { complements: atHome, verbPhrase: { aspect: 'resultative' } }) }).pt)
      .toBe('se o gato tivesse estado na casa, o cão correria.');
  });

  test('Portuguese keeps estar in the other compound tenses, a plural command and a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'BE', { complements: tired, verbPhrase: { tense: 'future', aspect: 'resultative' } })).pt).toBe('o gato terá estado cansado.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: tired, verbPhrase: { modals: ['CAN'], aspect: 'resultative' } })).pt).toBe('o gato pode ter estado cansado.');
    expect(sayAll({ ...clause(np('SECOND_PERSON', { number: 'plural' }), 'BE', { complements: tired }), imperative: true }).pt).toBe('estejam cansados.');
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE', aspect: 'resultative' }, complements: tired } }), 'RUN')).pt).toBe('o gato que esteve cansado corre.');
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), condition: clause(np('DOG'), 'BE', { complements: atHome, verbPhrase: { aspect: 'resultative' } }) }).pt)
      .toBe('se o cão tivesse estado na casa, o gato correria.');
  });

  test('regression: a predicate noun keeps ser in every form', () => {
    const legend = { predicative: { phrase: np('LEGEND') } };
    expect(sayAll(clause(np('CAT'), 'BE', { complements: legend, verbPhrase: { modals: ['MUST'] } })).pt).toBe('o gato deve ser uma lenda.');
    expect(sayAll(clause(np('CAT'), 'BE', { complements: legend, verbPhrase: { aspect: 'resultative' } })).pt).toBe('o gato foi uma lenda.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE', { complements: legend }), imperative: true }).pt).toBe('seja uma lenda.');
  });
});

// A76. The copula BE is an auxiliary for adverb placement: ALWAYS/NEVER follow its finite form
// ("is always tired"), and its "not" ("is not always tired"). The engine treats an affirmative BE
// like a lexical verb and puts the adverb first ("always is tired"). A negated BE drops a
// frequency adverb altogether ("is not tired").
describe('known bugs: English frequency adverb with the copula', () => {
  test('English puts ALWAYS/NEVER after the finite "be" and its "not"', () => {
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'ALWAYS' }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat is always tired.');
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'NEVER' }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat is never tired.');
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'ALWAYS', tense: 'past' }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat was always tired.');
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'ALWAYS', negative: true }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat is not always tired.');
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'ALWAYS', negative: true, tense: 'future' }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat will not always be tired.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'BE', modifier: 'ALWAYS' }, complements: { predicative: { phrase: np('TIRED') } } } }), 'RUN'), 'en')).toBe('the dog that is always tired runs.');
  });

  const beTired = (verbPhrase: Partial<VerbPhrase>, subject = np('CAT')) =>
    say(clause(subject, 'BE', { verbPhrase, complements: { predicative: { phrase: np('TIRED') } } }), 'en');

  test('English keeps the slot for every person, a location, a negated past, a negated relative and NEVER with not', () => {
    expect(beTired({ modifier: 'ALWAYS' }, np('FIRST_PERSON'))).toBe('I am always tired.');
    expect(beTired({ modifier: 'NEVER', tense: 'past' }, np('SECOND_PERSON'))).toBe('you were never tired.');
    expect(beTired({ modifier: 'ALWAYS', negative: true, tense: 'past' })).toBe('the cat was not always tired.');
    expect(beTired({ modifier: 'NEVER', negative: true })).toBe('the cat is never tired.');
    expect(say(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'ALWAYS' }, complements: { locative: { phrase: np('HOUSE') } } }), 'en')).toBe('the cat is always in the house.');
    expect(say(clause(np('DOG', { relative: { verbPhrase: { verb: 'BE', modifier: 'ALWAYS', negative: true }, complements: { predicative: { phrase: np('TIRED') } } } }), 'RUN'), 'en'))
      .toBe('the dog that is not always tired runs.');
  });

  test('regression: the future, a modal, an aspect and a lexical verb are unchanged', () => {
    expect(beTired({ modifier: 'ALWAYS', tense: 'future' })).toBe('the cat will always be tired.');
    expect(beTired({ modifier: 'ALWAYS', modals: [{ verb: 'MUST' }] })).toBe('the cat must always be tired.');
    expect(beTired({ modifier: 'ALWAYS', aspect: 'progressive' })).toBe('the cat is always being tired.');
    expect(say(clause(np('CAT'), 'BECOME', { verbPhrase: { modifier: 'ALWAYS' }, complements: { predicative: { phrase: np('TIRED') } } }), 'en')).toBe('the cat always becomes tired.');
  });
});

// A84. The Italian impersonal "si" takes a singular verb, but a predicate adjective or an essere
// participle agreeing with it is masculine plural ("si è stanchi", "si è andati"). The engine agrees
// both with GENERIC_PERSON's seeded 3sg features.
describe('known bugs: Italian agreement with the impersonal si', () => {
  test('Italian agrees a predicate with the impersonal si in the masculine plural', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'it')).toBe('si è stanchi.');
    expect(say(clause(np('GENERIC_PERSON'), 'BECOME', { complements: { predicative: { phrase: np('TIRED') } } }), 'it')).toBe('si diventa stanchi.');
    expect(say(clause(np('GENERIC_PERSON'), 'GO', { verbPhrase: { aspect: 'resultative' } }), 'it')).toBe('si è andati.');
  });

  test('Italian agrees in the masculine plural under SEEM, in the past and in the compound of BECOME', () => {
    expect(say(clause(np('GENERIC_PERSON'), 'SEEM', { complements: { predicative: { phrase: np('TIRED') } } }), 'it')).toBe('si sembra stanchi.');
    expect(say(clause(np('GENERIC_PERSON'), 'GO', { verbPhrase: { aspect: 'resultative', tense: 'past' } }), 'it')).toBe('si era andati.');
    expect(say(clause(np('GENERIC_PERSON'), 'BECOME', { verbPhrase: { aspect: 'resultative' }, complements: { predicative: { phrase: np('TIRED') } } }), 'it'))
      .toBe('si è diventati stanchi.');
  });

  test('regression: a noun subject agrees as itself', () => {
    expect(say(clause(np('CAT', { gender: 'fem' }), 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'it')).toBe('la gatta è stanca.');
  });
});

// B12 (fixed). `copulaSegs` used to inflect です against `firstConjunct` only, so a coordinated
// adjective predicate lost every conjunct after the first: "the cat is big and happy" → 猫は大きいです.
// Japanese chains predicates with the te-form and leaves the copula to the last conjunct (大きくて幸せです,
// 伝説で犬です). "Or" joins whole predicates with か (大きいか幸せです), and a negation reads "neither …
// nor", も on every conjunct (大きくも幸せでもありません). The same te-form replaces the と that joined
// predicates under なる / 思える (大きくて幸せに思えます).
describe('Japanese coordinated copula predicate', () => {
  const both = (conjunction: 'and' | 'or', ...conjuncts: NounPhrase[]) => ({ phrase: { conjuncts, conjunction } });
  const catIs = (predicative: ReturnType<typeof both>, verbPhrase: object = {}, verb = 'BE') =>
    sayAll(clause(np('CAT'), verb, { verbPhrase, complements: { predicative } })).ja;
  const catWhoIs = (predicative: ReturnType<typeof both>, verbPhrase: object = {}) =>
    sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE', ...verbPhrase }, complements: { predicative } } }), 'RUN')).ja;

  test('Japanese keeps every conjunct of a coordinated adjective predicate', () => {
    expect(sayAll(clause(np('CAT'), 'BE', {
      complements: { predicative: { phrase: { conjuncts: [np('BIG'), np('HAPPY')], conjunction: 'and' } } },
    })).ja).toBe('猫は大きくて幸せです。');
  });

  test('"and" chains each class in its te-form, the copula on the last', () => {
    expect(catIs(both('and', np('BIG'), np('LEGEND')))).toBe('猫は大きくて伝説です。');
    expect(catIs(both('and', np('HAPPY'), np('BIG')))).toBe('猫は幸せで大きいです。');
    expect(catIs(both('and', np('BROWN'), np('BIG')))).toBe('猫は茶色で大きいです。');
    expect(catIs(both('and', np('TIRED'), np('HAPPY')))).toBe('猫は疲れていて幸せです。');
    expect(catIs(both('and', np('HAPPY'), np('TIRED')))).toBe('猫は幸せで疲れています。');
    expect(catIs(both('and', np('LEGEND'), np('DOG', { definiteness: 'indefinite' })))).toBe('猫は伝説で犬です。');
    expect(catIs(both('and', np('BIG'), np('HAPPY'), np('LEGEND')))).toBe('猫は大きくて幸せで伝説です。');
    expect(catIs(both('and', np('BIG', { headDegree: 'more' }), np('HAPPY')))).toBe('猫はもっと大きくて幸せです。');
    expect(catIs(both('and', np('BIG'), np('HAPPY')), { tense: 'past' })).toBe('猫は大きくて幸せでした。');
  });

  test('a negation reads "neither … nor", in the present and the past', () => {
    expect(catIs(both('and', np('BIG'), np('HAPPY')), { negative: true })).toBe('猫は大きくも幸せでもありません。');
    expect(catIs(both('and', np('BIG'), np('HAPPY')), { negative: true, tense: 'past' })).toBe('猫は大きくも幸せでもありませんでした。');
    expect(catIs(both('or', np('BIG'), np('HAPPY')), { negative: true })).toBe('猫は大きくも幸せでもありません。');
    expect(catIs(both('and', np('HAPPY'), np('TIRED')), { negative: true })).toBe('猫は幸せでも疲れてもいません。');
  });

  test('"or" joins whole predicates with か', () => {
    expect(catIs(both('or', np('BIG'), np('HAPPY')))).toBe('猫は大きいか幸せです。');
    expect(catIs(both('or', np('HAPPY'), np('BIG')))).toBe('猫は幸せか大きいです。');
    expect(catIs(both('or', np('BIG'), np('HAPPY')), { tense: 'past' })).toBe('猫は大きかったか幸せでした。');
    expect(catIs(both('or', np('LEGEND'), np('DOG', { definiteness: 'indefinite' })))).toBe('猫は伝説か犬です。');
    expect(catIs(both('or', np('TIRED'), np('HAPPY')), { tense: 'past' })).toBe('猫は疲れていたか幸せでした。');
  });

  test('a relative clause, an "if" clause, a citation, a modal and a command close on the last conjunct', () => {
    expect(catWhoIs(both('and', np('BIG'), np('HAPPY')))).toBe('大きくて幸せな猫は走ります。');
    expect(catWhoIs(both('and', np('BIG'), np('HAPPY')), { tense: 'past' })).toBe('大きくて幸せだった猫は走ります。');
    expect(catWhoIs(both('and', np('BIG'), np('HAPPY')), { negative: true })).toBe('大きくも幸せでもない猫は走ります。');
    expect(catWhoIs(both('and', np('BIG'), np('TIRED')), { negative: true })).toBe('大きくも疲れてもいない猫は走ります。');
    expect(catWhoIs(both('and', np('BIG'), np('LEGEND')))).toBe('大きくて伝説である猫は走ります。');
    expect(catWhoIs(both('or', np('BIG'), np('HAPPY')))).toBe('大きいか幸せな猫は走ります。');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'BE', { complements: { predicative: both('and', np('BIG'), np('HAPPY')) } }) }).ja)
      .toBe('もし猫が大きくて幸せだったら、犬は走ります。');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'BE', { verbPhrase: { negative: true }, complements: { predicative: both('and', np('BIG'), np('HAPPY')) } }) }).ja)
      .toBe('もし猫が大きくも幸せでもなかったら、犬は走ります。');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'BE', { complements: { predicative: both('and', np('BIG'), np('HAPPY')) } }), infinitive: true }).ja)
      .toBe('大きくて幸せである。');
    expect(catIs(both('and', np('BIG'), np('HAPPY')), { modals: ['MUST'] })).toBe('猫は大きくて幸せである必要があります。');
    expect(catIs(both('and', np('BIG'), np('HAPPY')), { modals: ['WILL'] })).toBe('猫は大きくて幸せでありたいです。');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE', { complements: { predicative: both('and', np('BIG'), np('HAPPY')) } }), imperative: true }).ja)
      .toBe('大きくて幸せになってください。');
  });

  test('under なる and 思える the te-form replaces the と that joined things', () => {
    expect(catIs(both('and', np('BIG'), np('HAPPY')), {}, 'SEEM')).toBe('猫は大きくて幸せに思えます。');
    expect(catIs(both('and', np('HAPPY'), np('TIRED')), {}, 'SEEM')).toBe('猫は幸せで疲れているように思えます。');
    expect(catIs(both('and', np('LEGEND'), np('DOG', { definiteness: 'indefinite' })), {}, 'SEEM')).toBe('猫は伝説で犬に思えます。');
    expect(catIs(both('and', np('BIG'), np('HAPPY')), {}, 'BECOME')).toBe('猫は大きくて幸せになります。');
    expect(catIs(both('and', np('HAPPY'), np('BIG')), {}, 'BECOME')).toBe('猫は幸せで大きくなります。');
    // "Or" keeps its か, the に once after the last conjunct.
    expect(catIs(both('or', np('LEGEND'), np('DOG', { definiteness: 'indefinite' })), {}, 'SEEM')).toBe('猫は伝説か犬に思えます。');
  });

  test('regression: a single predicate is unchanged', () => {
    expect(catIs(both('and', np('BIG')))).toBe('猫は大きいです。');
    expect(catIs(both('and', np('HAPPY')), { negative: true, tense: 'past' })).toBe('猫は幸せではありませんでした。');
  });
});

// A115. `copulaSegs` and `complementSegs` sort a predicate adjective into …い or …な; anything else
// takes the noun branch, which keeps the stored attributive base and skips the degree adverb. The
// 30 の-adjectives read 茶色のです / 茶色のになります, the 4 た-adjectives 疲れたです. Want 茶色です /
// 茶色になります / 疲れています.
describe('known bugs: Japanese の/た adjective as a predicate', () => {
  test('Japanese drops the attributive の and turns た into ている in a predicate', () => {
    const catIs = (verb: string, adjective: string, headDegree: 'positive' | 'more' = 'positive') =>
      sayAll(clause(np('CAT'), verb, { complements: { predicative: { phrase: np(adjective, { headDegree }) } } })).ja;
    expect(catIs('BE', 'BROWN')).toBe('猫は茶色です。');
    expect(catIs('BE', 'BROWN', 'more')).toBe('猫はもっと茶色です。');
    expect(catIs('BECOME', 'BROWN')).toBe('猫は茶色になります。');
    expect(catIs('SEEM', 'ADULT')).toBe('猫は大人に思えます。');
    expect(catIs('BE', 'TIRED')).toBe('猫は疲れています。');
    expect(catIs('SEEM', 'TIRED')).toBe('猫は疲れているように思えます。');
  });

  test('Japanese inflects the の/た predicate for tense and polarity', () => {
    const catIs = (adjective: string, verbPhrase: object) =>
      sayAll(clause(np('CAT'), 'BE', { verbPhrase, complements: { predicative: { phrase: np(adjective) } } })).ja;
    expect(catIs('ADULT', {})).toBe('猫は大人です。');
    expect(catIs('BROWN', { negative: true, tense: 'past' })).toBe('猫は茶色ではありませんでした。');
    expect(catIs('TIRED', { negative: true })).toBe('猫は疲れていません。');
    expect(catIs('TIRED', { tense: 'past' })).toBe('猫は疲れていました。');
  });

  test('regression: the i- and na-adjectives and the noun predicate are unchanged', () => {
    const catIs = (verb: string, predicate: string) =>
      sayAll(clause(np('CAT'), verb, { complements: { predicative: { phrase: np(predicate) } } })).ja;
    expect(catIs('BE', 'BIG')).toBe('猫は大きいです。');
    expect(catIs('BE', 'CAREFUL')).toBe('猫は慎重です。');
    expect(catIs('SEEM', 'HAPPY')).toBe('猫は幸せに思えます。');
    expect(catIs('BECOME', 'LEGEND')).toBe('猫は伝説になります。');
  });
});
