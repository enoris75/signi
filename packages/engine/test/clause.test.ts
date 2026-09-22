import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll, wordAll } from './harness.js';

// The shape of a clause: subject, verb, object — agreement, case, and word order.
describe('clause', () => {
  test('subject and verb', () => {
    expect(sayAll(clause(np('CAT'), 'EAT'))).toEqual({
      en: 'the cat eats.',
      it: 'il gatto mangia.',
      fr: 'le chat mange.',
      es: 'el gato come.',
      pt: 'o gato come.',
      de: 'der Kater frisst.',
      ja: '猫は食べます。',
    });
  });

  test('a verbless period is a bare noun phrase', () => {
    expect(sayAll({ subject: np('CAT') })).toEqual({
      en: 'the cat.',
      it: 'il gatto.',
      fr: 'le chat.',
      es: 'el gato.',
      pt: 'o gato.',
      de: 'der Kater.',
      ja: '猫。',
    });
  });

  test('a verbless period drops objects and complements — they hang off the verb', () => {
    // A half-built plan with no verb renders just the subject: the directObject and the locative
    // are meaningless without a verb, so they are dropped, not rendered loose.
    const bareSubject = sayAll({ subject: np('CAT') });
    expect(sayAll({
      subject: np('CAT'),
      directObject: np('MOUSE'),
      complements: { locative: { phrase: np('HOUSE') } },
    } as PhrasePlan)).toEqual(bareSubject);
  });

  test('the verb agrees with a plural subject', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT'))).toEqual({
      en: 'the cats eat.',
      it: 'i gatti mangiano.',
      fr: 'les chats mangent.',
      es: 'los gatos comen.',
      pt: 'os gatos comem.',
      de: 'die Kater fressen.',
      // Japanese does not mark number on the noun or agree the verb.
      ja: '猫は食べます。',
    });
  });

  test('a gendered noun selects its feminine lexeme, and the article follows', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'EAT'))).toEqual({
      en: 'the cat eats.',
      it: 'la gatta mangia.',
      fr: 'la chatte mange.',
      es: 'la gata come.',
      pt: 'a gata come.',
      de: 'die Katze frisst.',
      ja: '猫は食べます。',
    });
  });

  test('a direct object takes the accusative', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }))).toEqual({
      en: 'the cat eats the mouse.',
      it: 'il gatto mangia il topo.',
      fr: 'le chat mange la souris.',
      es: 'el gato come el ratón.',
      pt: 'o gato come o rato.',
      // German is the only one of the seven that marks the case on the article.
      de: 'der Kater frisst die Maus.',
      // Japanese marks it with the particle を.
      ja: '猫はネズミを食べます。',
    });
  });

  test('the verb agrees with the person of a pronoun subject', () => {
    // Italian, Spanish and Portuguese are pro-drop: the pronoun subject is dropped and the verb
    // ending alone carries the person ("mangio", not "io mangio"). French, German and English keep
    // the overt pronoun, so the agreement shows there as the pronoun + inflected verb.
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT'))).toEqual({
      en: 'I eat.',
      it: 'mangio.',
      fr: 'je mange.',
      es: 'como.',
      pt: 'como.',
      de: 'ich esse.',
      ja: '私は食べます。',
    });

    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT'))).toEqual({
      en: 'they eat.',
      it: 'mangiano.',
      fr: 'ils mangent.',
      es: 'comen.',
      pt: 'comem.',
      de: 'sie essen.',
      ja: '彼らは食べます。',
    });
  });
});

// A98. A specific human direct object takes the preposition "a" in Spanish ("ve al niño", "mata a un
// hombre"). `predicateText` renders every noun object with `npText`, so the "a" is never there. The
// corpus already marks personhood (`human`, surfaced on the forms since A7).
describe('known bugs: Spanish personal "a"', () => {
  test('Spanish marks a human direct object with "a"', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY') })).es).toBe('el gato ve al niño.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('WOMAN') })).es).toBe('el gato ve a la mujer.');
    expect(sayAll(clause(np('CAT'), 'KILL', { directObject: np('MAN', { definiteness: 'indefinite' }) })).es)
      .toBe('el gato mata a un hombre.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY', { definiteness: 'no' }) })).es)
      .toBe('el gato no ve a ningún niño.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('BOY') } }), 'RUN')).es)
      .toBe('el perro que ve al niño corre.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'LOVE', { directObject: np('CHILD') }), imperative: true }).es)
      .toBe('ama al niño.');
  });

  test('Spanish marks the plural, a quantifier, a demonstrative, a possessive, a group and the infinitive', () => {
    const sees = (directObject: NonNullable<Parameters<typeof clause>[2]>['directObject']) => sayAll(clause(np('CAT'), 'SEE', { directObject })).es;
    expect(sees(np('MAN', { number: 'plural' }))).toBe('el gato ve a los hombres.');
    expect(sees(np('PERSON', { number: 'plural', definiteness: 'some' }))).toBe('el gato ve a algunas personas.');
    expect(sees(np('WOMAN', { definiteness: 'this' }))).toBe('el gato ve a esta mujer.');
    expect(sees(np('FATHER', { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }))).toBe('el gato ve a su padre.');
    expect(sees(np('FATHER', { possessor: np('BOY') }))).toBe('el gato ve al padre del niño.');
    expect(sees(np('MAN', { adjectives: ['OLD'] }))).toBe('el gato ve al hombre viejo.');
    expect(sees({ conjuncts: [np('BOY'), np('WOMAN')], conjunction: 'and' })).toBe('el gato ve al niño y a la mujer.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'LOVE', { directObject: np('CHILD') }), infinitive: true }).es).toBe('amar al niño.');
  });

  test('Spanish keeps the impersonal se singular before the personal "a"', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('BOY', { number: 'plural' }) })).es).toBe('se ve a los niños.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' } })).es)
      .toBe('se nos ve a él y a mí.');
  });

  test('regression: a bare human, an animal, a thing and the passive se keep their forms', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY', { number: 'plural', definiteness: 'bare' }) })).es).toBe('el gato ve niños.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('DOG') })).es).toBe('el gato ve el perro.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('HOUSE', { number: 'plural' }) })).es).toBe('se ven las casas.');
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } } })).es).toBe('el gato da el libro al niño.');
  });
});

// A148. ANGEL is seeded `animate` but not `human`, the concept-level "the referent is a person" flag.
// Both rules that read it skip the angel: Spanish leaves out the personal "a" ("ama este ángel")
// and English relativises with "that". The engine is right; the corpus entry is not.
describe('known bugs: ANGEL is a person', () => {
  test('Spanish marks ANGEL with the personal "a"', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('ANGEL') }), 'es')).toBe('el gato ve al ángel.');
    expect(say(clause(np('MAN', { definiteness: 'that' }), 'LOVE', {
      directObject: np('ANGEL', { definiteness: 'this' }), verbPhrase: { tense: 'past' },
    }), 'es')).toBe('ese hombre amaba a este ángel.');
  });

  test('English relativises ANGEL with "who"', () => {
    expect(say(clause(np('ANGEL', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('CAT') } }), 'RUN'), 'en'))
      .toBe('the angel who sees the cat runs.');
  });

  // The generalisation: the flag is read per referent, so every determiner and number takes the "a",
  // and the English "who" reaches the object gap as well.
  test('the personal "a" reaches an indefinite and a plural angel', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('ANGEL', { definiteness: 'indefinite' }) }), 'es'))
      .toBe('el gato ve a un ángel.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('ANGEL', { number: 'plural' }) }), 'es'))
      .toBe('el gato ve a los ángeles.');
  });

  test('English takes "who" on an object gap too', () => {
    expect(say(clause(np('ANGEL', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'SEE' } } }), 'RUN'), 'en'))
      .toBe('the angel who the cat sees runs.');
  });

  test('regression: Portuguese takes no personal "a"', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('ANGEL') }), 'pt')).toBe('o gato vê o anjo.');
  });

  // Neither rule fires on a thing, and neither fires on an angel in the subject slot.
  test('regression: a thing keeps the bare object and "that"', () => {
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('HOUSE') }), 'es')).toBe('el gato ve la casa.');
    expect(say(clause(np('HOUSE', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('CAT') } }), 'RUN'), 'en'))
      .toBe('the house that sees the cat runs.');
    expect(say(clause(np('ANGEL'), 'SEE', { directObject: np('CAT') }), 'es')).toBe('el ángel ve el gato.');
  });
});

// A157. German has two verbs for eating: "essen" for a person, "fressen" for an animal. The corpus
// seeds only "essen" (`concepts/verbs/transitive.ts`), so every animal in it eats like a person. The
// other six languages have one verb, and so has English. A corpus entry, not the grammar — but unlike
// A148 it needs a second paradigm, not a flag.
describe('known bugs: a German animal "frisst"', () => {
  const catEatsMouse = (verbPhrase: Partial<VerbPhrase> = {}) =>
    say(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), verbPhrase }), 'de');

  test('an animal subject takes "fressen" in every form', () => {
    expect(catEatsMouse()).toBe('der Kater frisst die Maus.');
    expect(say(clause(np('CAT', { number: 'plural' }), 'EAT', { directObject: np('MOUSE') }), 'de')).toBe('die Kater fressen die Maus.');
    expect(catEatsMouse({ tense: 'past' })).toBe('der Kater fraß die Maus.');
    expect(catEatsMouse({ aspect: 'resultative' })).toBe('der Kater hat die Maus gefressen.');
    expect(catEatsMouse({ tense: 'future' })).toBe('der Kater wird die Maus fressen.');
    expect(catEatsMouse({ modals: ['MUST'] })).toBe('der Kater muss die Maus fressen.');
  });

  test('…and so does an animal in a relative clause', () => {
    expect(say(clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') } }), 'RUN'), 'de'))
      .toBe('der Kater, der die Maus frisst, läuft.');
    expect(say(clause(np('WOLF'), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('der Wolf frisst das Essen.');
  });

  // The generalisation: "which subjects are animals" is the whole is-a chain (CAT isA MAMMAL isA
  // ANIMAL), so the genus itself counts and an `animate` non-animal does not.
  test('the rule is the hierarchy, not the animacy flag', () => {
    expect(say(clause(np('ANIMAL'), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('das Tier frisst das Essen.');
    expect(say(clause(np('ANGEL'), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('der Engel isst das Essen.');
    expect(say(clause(np('CREATOR'), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('der Schöpfer isst das Essen.');
  });

  // The subject selects the verb, so an object relative reads its OWN subject, and the citation —
  // whose subject is a throwaway the plan never renders — keeps the dictionary "essen".
  test('an object relative reads its own subject, and the citation keeps "essen"', () => {
    expect(say(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT' } } }), 'RUN'), 'de'))
      .toBe('die Maus, die der Kater frisst, läuft.');
    expect(say(clause(np('MOUSE', { relative: { headRole: 'directObject', subject: np('BOY'), verbPhrase: { verb: 'EAT' } } }), 'RUN'), 'de'))
      .toBe('die Maus, die der Junge isst, läuft.');
    expect(say({ ...clause(np('DOG'), 'EAT', { directObject: np('FOOD') }), infinitive: true }, 'de'))
      .toBe('das Essen essen.');
  });

  // An infinitive COMPLEMENT is the opposite case: its subject is the governing clause's, by
  // subject control, so it follows the controller.
  test('…but an infinitive complement follows its controlling subject', () => {
    expect(say(clause(np('DOG'), 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') } }), 'de'))
      .toBe('der Hund wünscht, das Essen zu fressen.');
    expect(say(clause(np('BOY'), 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'EAT' }, directObject: np('FOOD') } }), 'de'))
      .toBe('der Junge wünscht, das Essen zu essen.');
  });

  test('regression: a person keeps "essen", as do a pronoun, a command and the other six', () => {
    expect(say(clause(np('BOY'), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('der Junge isst das Essen.');
    expect(say(clause(np('THIRD_PERSON', { gender: 'masc' }), 'EAT', { directObject: np('FOOD') }), 'de')).toBe('er isst das Essen.');
    expect(say({ ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE') }), imperative: true }, 'de')).toBe('iss die Maus.');
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }))).toMatchObject({
      en: 'the cat eats the mouse.',
      it: 'il gatto mangia il topo.',
    });
  });
});

// A120. BE with no complement at all ("the cat is", "Antarctica will not be") takes neither the copula
// path, which needs a predicative, nor A109's existential, which needs a locative. It falls through to
// the ordinary verb path on BE's fallback lexeme です, which has no stem, so the tense and polarity are
// lost and the modal, aspect, command and relative glue onto it: 猫はです, 猫はですことができます,
// ですください. The existential いる / ある already carries every form.
describe('known bugs: Japanese BE with no complement', () => {
  test('Japanese renders a bare BE as the existential いる / ある', () => {
    const be = (subject: string, verbPhrase: Partial<VerbPhrase> = {}) =>
      sayAll(clause(np(subject), 'BE', { verbPhrase })).ja;
    expect(be('CAT')).toBe('猫はいます。');
    expect(be('BOOK')).toBe('本はあります。');
    expect(be('CAT', { negative: true })).toBe('猫はいません。');
    expect(be('CAT', { tense: 'past' })).toBe('猫はいました。');
    expect(be('CAT', { tense: 'past', negative: true })).toBe('猫はいませんでした。');
    expect(be('ANTARCTICA', { tense: 'future', negative: true })).toBe('南極大陸はありません。');
    expect(be('CAT', { modals: ['CAN'] })).toBe('猫はいることができます。');
    expect(be('CAT', { aspect: 'progressive' })).toBe('猫はいます。');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE'), imperative: true }).ja).toBe('いてください。');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'BE' } } }), 'RUN')).ja).toBe('いる犬は走ります。');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'BE') }).ja).toBe('もし猫がいたら、犬は走ります。');
  });

  // An inanimate subject takes ある through every form, as an animate one takes いる. The resultative of
  // a state is its past, and the first-person plural command is the ましょう form.
  test('Japanese composes the inanimate ある, the resultative and the hortative the same way', () => {
    const ja = (plan: PhrasePlan) => say(plan, 'ja');
    expect(ja(clause(np('BOOK'), 'BE', { verbPhrase: { tense: 'past', negative: true } }))).toBe('本はありませんでした。');
    expect(ja(clause(np('BOOK'), 'BE', { verbPhrase: { modals: ['CAN'] } }))).toBe('本はあることができます。');
    expect(ja(clause(np('CAT'), 'BE', { verbPhrase: { aspect: 'resultative' } }))).toBe('猫はいました。');
    expect(ja(clause(np('BOOK', { relative: { verbPhrase: { verb: 'BE', tense: 'past' } } }), 'BURN'))).toBe('あった本は燃えます。');
    expect(ja({ ...clause(np('DOG'), 'RUN'), condition: clause(np('BOOK'), 'BE') })).toBe('もし本があったら、犬は走ります。');
    expect(ja({ ...clause(np('FIRST_PERSON', { number: 'plural' }), 'BE'), imperative: true })).toBe('いましょう。');
  });

  // Regression: BE with a complement keeps its own path. A predicate closes on です, and a place is the
  // existential with に (A109), in a main clause and in a relative.
  test('regression: Japanese BE with a predicate or a place is unchanged', () => {
    expect(say(clause(np('CAT'), 'BE', { complements: { predicative: { phrase: np('LEGEND') } } }), 'ja')).toBe('猫は伝説です。');
    expect(say(clause(np('CAT'), 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'ja')).toBe('猫は家にいます。');
    expect(say(clause(np('CAT', { relative: { verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('LEGEND') } } } }), 'RUN'), 'ja'))
      .toBe('伝説である猫は走ります。');
  });
});

// A133. A language name takes the article of a common noun. The seven language concepts are not
// `proper`, so English and German article them ("the boy reads the German", "der Junge liest das
// Deutsch" — and "the English" is the people), and the article a Romance language needs
// disappears when none is picked ("italiano è una lingua"). A continent is already right: English
// and German go bare (Europe, Europa), Italian, French and Portuguese always article, and Spanish
// articles only what `takes_article` marks (la Antártida). A language name is the Spanish exception.
describe('known bugs: the article on a language name', () => {
  const isALanguage = (language: string, definiteness?: 'bare') =>
    sayAll(clause(np(language, definiteness ? { definiteness } : {}), 'BE', {
      complements: { predicative: { phrase: np('LANGUAGE', { definiteness: 'indefinite' }) } },
    }));
  const boy = (verb: string, language: string, definiteness?: 'bare') =>
    sayAll(clause(np('BOY'), verb, { directObject: np(language, definiteness ? { definiteness } : {}) }));

  test('English and German name a language bare, and the Romance languages always article it', () => {
    expect(isALanguage('ITALIAN')).toMatchObject({ en: 'Italian is a language.', de: 'Italienisch ist eine Sprache.' });
    expect(boy('READ', 'GERMAN')).toMatchObject({ en: 'the boy reads German.', de: 'der Junge liest Deutsch.' });
    expect(boy('UNDERSTAND', 'ENGLISH')).toMatchObject({ en: 'the boy understands English.', de: 'der Junge versteht Englisch.' });
    expect(isALanguage('ITALIAN', 'bare')).toMatchObject({
      it: "l'italiano è una lingua.", fr: "l'italien est une langue.", es: 'el italiano es un idioma.', pt: 'o italiano é uma língua.',
    });
    expect(boy('UNDERSTAND', 'ITALIAN', 'bare').fr).toBe("le garçon comprend l'italien.");
  });

  // The article follows each name's own sound (it "lo spagnolo", fr "l'anglais"), the article the user
  // picks is ignored in both directions, and an Italian or French locative drops it as it does for a
  // continent, which is the idiom for a language too ("in italiano", "en italien").
  test('every language name, whatever article the user picks, and the locative', () => {
    expect(isALanguage('SPANISH')).toMatchObject({
      en: 'Spanish is a language.', it: 'lo spagnolo è una lingua.', fr: "l'espagnol est une langue.",
      de: 'Spanisch ist eine Sprache.', es: 'el español es un idioma.', pt: 'o espanhol é uma língua.',
    });
    expect(isALanguage('ENGLISH', 'bare')).toMatchObject({
      en: 'English is a language.', it: "l'inglese è una lingua.", fr: "l'anglais est une langue.", es: 'el inglés es un idioma.',
    });
    expect(sayAll(clause(np('JAPANESE', { definiteness: 'indefinite' }), 'BE', {
      complements: { predicative: { phrase: np('LANGUAGE', { definiteness: 'indefinite' }) } },
    }))).toMatchObject({ en: 'Japanese is a language.', it: 'il giapponese è una lingua.', de: 'Japanisch ist eine Sprache.' });
    expect(boy('READ', 'FRENCH')).toMatchObject({
      en: 'the boy reads French.', it: 'il ragazzo legge il francese.', de: 'der Junge liest Französisch.',
      es: 'el niño lee el francés.', pt: 'o menino lê o francês.',
    });
    expect(boy('READ', 'PORTUGUESE', 'bare')).toMatchObject({ it: 'il ragazzo legge il portoghese.', pt: 'o menino lê o português.' });
    expect(sayAll(clause(np('WORD'), 'BE', { complements: { locative: { phrase: np('ITALIAN') } } })))
      .toMatchObject({ en: 'the word is in Italian.', it: 'la parola è in italiano.', fr: 'le mot est en italien.' });
  });

  test('regression: the articled Romance name, the bare English and German one, continents and the word label', () => {
    expect(isALanguage('ITALIAN')).toMatchObject({
      it: "l'italiano è una lingua.", fr: "l'italien est une langue.", es: 'el italiano es un idioma.', pt: 'o italiano é uma língua.', ja: 'イタリア語は言語です。',
    });
    expect(isALanguage('ITALIAN', 'bare')).toMatchObject({ en: 'Italian is a language.', de: 'Italienisch ist eine Sprache.' });
    const isAContinent = (continent: string) =>
      sayAll(clause(np(continent), 'BE', { complements: { predicative: { phrase: np('CONTINENT', { definiteness: 'indefinite' }) } } }));
    expect(isAContinent('EUROPE')).toMatchObject({
      en: 'Europe is a continent.', it: "l'Europa è un continente.", es: 'Europa es un continente.', de: 'Europa ist ein Kontinent.',
    });
    expect(isAContinent('ANTARCTICA')).toMatchObject({ es: 'la Antártida es un continente.', de: 'die Antarktis ist ein Kontinent.' });
    expect(wordAll('ITALIAN')).toEqual({
      en: 'Italian', it: 'italiano', fr: 'italien', es: 'italiano', pt: 'italiano', de: 'Italienisch', ja: 'イタリア語',
    });
  });
});

// A207. French has no zero article on an object, so A149 gave a bare singular the partitive. That
// is right for a mass noun ("consommer de la nourriture") and wrong for a count one, which French
// articles with the definite: "changer la taille". `partitiveArtFor` does not look at countability,
// which the corpus carries and the lexicon already hands the engine as `uncountable`. Filed while
// authoring localization A24 (RESIZE, EDIT).
describe('known bugs: the French article on a bare singular count object (A207)', () => {
  // RESIZE's own definition plan. SIZE is a count noun; TEXT and WORD behave the same way.
  const changeSize: PhrasePlan = {
    subject: { concept: 'GENERIC_PERSON' },
    verbPhrase: { verb: 'CHANGE' },
    directObject: { concept: 'SIZE', definiteness: 'bare' },
    infinitive: true,
  };

  test.fails('French articles a bare singular count object with the definite', () => {
    expect(sayAll(changeSize).fr).toBe('changer la taille.');
  });

  // Already right, and what the fix must not disturb: a bare singular MASS object keeps the
  // partitive, and a bare plural count object keeps "des".
  test('a mass object keeps the partitive and a plural count object keeps des', () => {
    expect(sayAll({
      subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'CONSUME' },
      directObject: { concept: 'FOOD', definiteness: 'bare' }, infinitive: true,
    }).fr).toBe('consommer de la nourriture.');
    expect(sayAll({
      subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'REMOVE' },
      directObject: { concept: 'OBJECT_THING', definiteness: 'bare', number: 'plural' }, infinitive: true,
    }).fr).toBe('retirer des objets.');
  });

  // The other six languages are right on the failing row, which is what localises the defect.
  test('the other six write no article there', () => {
    expect(sayAll(changeSize)).toMatchObject({
      en: 'to change size.', it: 'cambiare dimensione.', de: 'Größe ändern.',
      es: 'cambiar tamaño.', ja: '大きさを変える。', pt: 'mudar tamanho.',
    });
  });
});
