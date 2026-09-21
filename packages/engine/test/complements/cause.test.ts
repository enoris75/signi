import { describe, expect, test } from 'vitest';
import type { CauseSentiment, NounElement, NounPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

const criesBecauseOf = (value: CauseSentiment) =>
  sayAll(clause(np('CAT'), 'CRY', {
    complements: { cause: { phrase: np('DOG'), specifiers: [{ kind: 'sentiment', value }] } },
  }));

// Why the action happened. The cause carries a sentiment specifier — the affective stance the
// speaker takes to it: neutral ("because of"), negative ("fault of"), positive ("thanks to").
describe('cause', () => {
  test('neutral — "because of"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG') } } })))
      .toMatchObject({
        en: 'the cat cries because of the dog.',
        it: 'il gatto piange a causa del cane.',
        fr: 'le chat pleure à cause du chien.',
        ja: '猫は犬のために泣きます。',
      });
  });

  test('positive — "thanks to"', () => {
    expect(criesBecauseOf('positive')).toMatchObject({
      en: 'the cat cries thanks to the dog.',
      it: 'il gatto piange grazie al cane.',
      fr: 'le chat pleure grâce au chien.',
      es: 'el gato llora gracias al perro.',
      de: 'der Kater weint dank dem Hund.',
      ja: '猫は犬のおかげで泣きます。',
    });
  });

  test('negative — "through the fault of"', () => {
    expect(criesBecauseOf('negative')).toMatchObject({
      it: 'il gatto piange per colpa del cane.',
      fr: 'le chat pleure par la faute du chien.',
      es: 'el gato llora por culpa del perro.',
      pt: 'o gato chora por culpa do cão.',
      ja: '猫は犬のせいで泣きます。',
    });
  });
});

// The copulars (BECOME, SEEM, APPEAR, BE) recently grew a cause: a state can be held *because of*
// something. The connector is the same neutral "because of" the action verbs use — the marking
// belongs to the complement, not to the verb, so a copula carries it identically.
describe('cause: the copular verbs', () => {
  const because = (verb: string) =>
    sayAll(clause(np('CAT'), verb, { complements: { cause: { phrase: np('DOG') } } }));

  test('BECOME takes a neutral cause', () => {
    expect(because('BECOME')).toMatchObject({
      en: 'the cat becomes because of the dog.',
      it: 'il gatto diventa a causa del cane.',
      fr: 'le chat devient à cause du chien.',
      de: 'der Kater wird wegen des Hundes.',
      ja: '猫は犬のためになります。',
    });
  });

  test('SEEM, APPEAR and BE mark it the same way', () => {
    expect(because('SEEM')).toMatchObject({
      en: 'the cat seems because of the dog.',
      it: 'il gatto sembra a causa del cane.',
    });
    expect(because('APPEAR')).toMatchObject({
      en: 'the cat appears because of the dog.',
      de: 'der Kater erscheint wegen des Hundes.',
    });
    expect(because('BE')).toMatchObject({
      en: 'the cat is because of the dog.',
      fr: 'le chat est à cause du chien.',
    });
  });
});

// English and German now distinguish the negative sentiment too, so all seven languages carry the
// user's stance. English uses the "through the fault of" periphrasis; German the genitive "durch
// die Schuld" + the blamed party in the genitive ("durch die Schuld des Hundes"). Was B02.
describe('cause: the negative sentiment in English and German', () => {
  test('English lays blame with "through the fault of"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ en: 'the cat cries through the fault of the dog.' });
  });

  test('German lays blame with the genitive "durch die Schuld"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ de: 'der Kater weint durch die Schuld des Hundes.' });
  });

  // The genitive is the whole point of the German periphrasis, so exercise the article/ending
  // across gender and number: neuter "des Wortes", feminine "der Katze", plural "der Hunde".
  const blamedOn = (party: Parameters<typeof np>[0], opts?: Parameters<typeof np>[1]) =>
    sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np(party, opts), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    }));

  test('German genitive declines for gender and number', () => {
    expect(blamedOn('WORD')).toMatchObject({ de: 'der Kater weint durch die Schuld des Wortes.' }); // neuter -es
    expect(blamedOn('MOUSE')).toMatchObject({ de: 'der Kater weint durch die Schuld der Maus.' }); // feminine, no ending
    expect(blamedOn('DOG', { number: 'plural' })).toMatchObject({ de: 'der Kater weint durch die Schuld der Hunde.' }); // plural
  });

  test('English "through the fault of" reaches a plural and an indefinite', () => {
    expect(blamedOn('DOG', { number: 'plural' })).toMatchObject({ en: 'the cat cries through the fault of the dogs.' });
    expect(blamedOn('DOG', { definiteness: 'indefinite' })).toMatchObject({ en: 'the cat cries through the fault of a dog.' });
  });

  // A pronoun cause carries the stance too: English reuses the connector ("through the fault of
  // him"); German the possessive periphrasis ("durch seine Schuld"), the possessive agreeing with
  // feminine "Schuld".
  const blamedOnPerson = (person: 'FIRST_PERSON' | 'SECOND_PERSON' | 'THIRD_PERSON', opts?: Parameters<typeof np>[1]) =>
    sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np(person, opts), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    }));

  test('a negative pronoun cause: English connector, German possessive', () => {
    expect(blamedOnPerson('THIRD_PERSON')).toMatchObject({
      en: 'the cat cries through the fault of him.',
      de: 'der Kater weint durch seine Schuld.',
    });
    expect(blamedOnPerson('FIRST_PERSON')).toMatchObject({
      en: 'the cat cries through the fault of me.',
      de: 'der Kater weint durch meine Schuld.',
    });
    expect(blamedOnPerson('THIRD_PERSON', { gender: 'fem' })).toMatchObject({
      de: 'der Kater weint durch ihre Schuld.',
    });
  });

  // Regression: the neutral and positive connectors are untouched by the negative fix.
  test('neutral and positive connectors are unchanged', () => {
    expect(criesBecauseOf('positive')).toMatchObject({ en: 'the cat cries thanks to the dog.', de: 'der Kater weint dank dem Hund.' });
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG') } } })))
      .toMatchObject({ en: 'the cat cries because of the dog.', de: 'der Kater weint wegen des Hundes.' });
  });
});

// B09. "wegen" governs the genitive in standard written German: "wegen des Hundes", with the
// determiner, a possessive and the adjectives declined for it. A personal pronoun's genitive is not
// said after it; standard German fuses the possessive stem with "-etwegen" instead ("meinetwegen").
// Only where the genitive would not show, a determinerless plural, does it take the dative ("wegen
// Männern"). "dank" keeps the dative, which is standard beside its genitive. The engine used to write
// the colloquial dative after "wegen" ("wegen dem Hund", "wegen mir").
describe('documented simplifications fixed: German "wegen" takes the genitive', () => {
  const runsBecauseOf = (phrase: NounElement, value: CauseSentiment = 'neutral') =>
    say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } }), 'de');
  const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;

  test('a noun cause is in the genitive', () => {
    expect(runsBecauseOf(np('DOG'))).toBe('der Kater läuft wegen des Hundes.');
    expect(runsBecauseOf(np('CAT', { gender: 'fem' }))).toBe('der Kater läuft wegen der Katze.');
    expect(runsBecauseOf(np('BOY'))).toBe('der Kater läuft wegen des Jungen.');
    expect(runsBecauseOf(np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] }))).toBe('der Kater läuft wegen eines großen Hundes.');
    expect(runsBecauseOf(np('DOG', { possessor: mine }))).toBe('der Kater läuft wegen meines Hundes.');
    expect(runsBecauseOf(np('DOG', { number: 'plural' }))).toBe('der Kater läuft wegen der Hunde.');
    expect(runsBecauseOf(np('EUROPE'))).toBe('der Kater läuft wegen Europas.');
    expect(runsBecauseOf(np('CAT', { gender: 'fem', definiteness: 'bare', number: 'plural', adjectives: ['SMALL'] })))
      .toBe('der Kater läuft wegen kleiner Katzen.');
  });

  test('a determinerless plural, whose genitive would not show, takes the dative', () => {
    expect(runsBecauseOf(np('MAN', { definiteness: 'bare', number: 'plural' }))).toBe('der Kater läuft wegen Männern.');
  });

  test('a personal pronoun is one "-etwegen" word, in every person', () => {
    const pronoun = (concept: string, extra: Partial<NounPhrase> = {}) => runsBecauseOf(np(concept, extra));
    expect(pronoun('FIRST_PERSON')).toBe('der Kater läuft meinetwegen.');
    expect(pronoun('SECOND_PERSON')).toBe('der Kater läuft deinetwegen.');
    expect(pronoun('THIRD_PERSON', { gender: 'masc' })).toBe('der Kater läuft seinetwegen.');
    expect(pronoun('THIRD_PERSON', { gender: 'fem' })).toBe('der Kater läuft ihretwegen.');
    expect(pronoun('THIRD_PERSON', { gender: 'neut' })).toBe('der Kater läuft seinetwegen.');
    expect(pronoun('FIRST_PERSON', { number: 'plural' })).toBe('der Kater läuft unseretwegen.');
    expect(pronoun('SECOND_PERSON', { number: 'plural' })).toBe('der Kater läuft euretwegen.');
    expect(pronoun('THIRD_PERSON', { number: 'plural' })).toBe('der Kater läuft ihretwegen.');
  });

  test('a relative clause on the cause takes the genitive relative pronoun', () => {
    expect(say(clause(np('DOG', { relative: { headRole: 'cause', subject: np('CAT'), verbPhrase: { verb: 'RUN' } } }), 'BURN'), 'de'))
      .toBe('der Hund, wegen dessen der Kater läuft, brennt.');
  });

  test('regression: "dank" keeps the dative, and the negative "Schuld" its genitive', () => {
    expect(runsBecauseOf(np('DOG'), 'positive')).toBe('der Kater läuft dank dem Hund.');
    expect(runsBecauseOf(np('SECOND_PERSON'), 'positive')).toBe('der Kater läuft dank dir.');
    expect(runsBecauseOf(np('DOG'), 'negative')).toBe('der Kater läuft durch die Schuld des Hundes.');
  });
});

// A54. The cause renderer picks its pronoun-or-noun branch from the FIRST conjunct only. A group
// that mixes pronouns and nouns then renders every conjunct down that one branch, and the negative
// possessive periphrasis ("durch meine Schuld") reads only the first pronoun.
describe('known bugs: German cause with coordinated pronouns', () => {
  const runsBecauseOf = (value: CauseSentiment, ...conjuncts: NounPhrase[]) =>
    sayAll(clause(np('CAT'), 'RUN', {
      complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } },
    })).de;

  test('German renders each cause conjunct in its own form', () => {
    expect(runsBecauseOf('neutral', np('MAN'), np('SECOND_PERSON'))).toBe('der Kater läuft wegen des Mannes und deinetwegen.');
    expect(runsBecauseOf('neutral', np('SECOND_PERSON'), np('MAN'))).toBe('der Kater läuft deinetwegen und wegen des Mannes.');
    expect(runsBecauseOf('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('der Kater läuft durch meine und deine Schuld.');
  });

  // "dank" is said once for the group; a pronoun's "wegen" is inside its one word ("meinetwegen", B09),
  // so under "wegen" every conjunct brings its own.
  test('German shares "dank" across a group holding a pronoun, in any order, and repeats "wegen"', () => {
    expect(runsBecauseOf('positive', np('MAN'), np('THIRD_PERSON', { number: 'plural' }))).toBe('der Kater läuft dank dem Mann und ihnen.');
    expect(runsBecauseOf('positive', np('THIRD_PERSON', { gender: 'fem' }), np('HOUSE'))).toBe('der Kater läuft dank ihr und dem Haus.');
    expect(runsBecauseOf('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('der Kater läuft wegen des Hundes, meinetwegen und wegen der Maus.');
  });

  test('German gives each conjunct its own "Schuld" in a negative group mixing a noun and a pronoun', () => {
    expect(runsBecauseOf('negative', np('DOG'), np('SECOND_PERSON'))).toBe('der Kater läuft durch die Schuld des Hundes und durch deine Schuld.');
    expect(runsBecauseOf('negative', np('SECOND_PERSON'), np('DOG'))).toBe('der Kater läuft durch deine Schuld und durch die Schuld des Hundes.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runsBecauseOf('neutral', np('FIRST_PERSON'))).toBe('der Kater läuft meinetwegen.');
    expect(runsBecauseOf('negative', np('THIRD_PERSON', { gender: 'fem' }))).toBe('der Kater läuft durch ihre Schuld.');
    expect(runsBecauseOf('neutral', np('DOG'), np('MOUSE'))).toBe('der Kater läuft wegen des Hundes und wegen der Maus.');
    expect(runsBecauseOf('negative', np('DOG'), np('MOUSE'))).toBe('der Kater läuft durch die Schuld des Hundes und der Maus.');
  });
});

// A65. The Italian cause builds its connector with `prepArt` (preposition + definite article) and
// never reads the complement's determiner, so every pick renders as "del/al". With "no", the
// concord still adds "non" but "nessun" is lost, and the sentence means the opposite.
describe('known bugs: Italian cause determiner', () => {
  const cries = (phrase: ReturnType<typeof np>, value: 'neutral' | 'negative' | 'positive' = 'neutral') =>
    say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } }), 'it');

  test('Italian keeps the cause\'s own determiner', () => {
    expect(cries(np('DOG', { definiteness: 'no' }))).toBe('il gatto non piange a causa di nessun cane.');
    expect(cries(np('DOG', { definiteness: 'indefinite' }))).toBe('il gatto piange a causa di un cane.');
    expect(cries(np('DOG', { definiteness: 'this' }))).toBe('il gatto piange a causa di questo cane.');
    expect(cries(np('DOG', { definiteness: 'bare', number: 'plural' }))).toBe('il gatto piange a causa di cani.');
    expect(cries(np('DOG', { definiteness: 'some', number: 'plural' }), 'negative')).toBe('il gatto piange per colpa di alcuni cani.');
    expect(cries(np('DOG', { definiteness: 'indefinite' }), 'positive')).toBe('il gatto piange grazie a un cane.');
  });

  test('Italian keeps the rest of the determiners, and fuses a continent and a partitive like the definite', () => {
    expect(cries(np('DOG', { definiteness: 'many', number: 'plural' }))).toBe('il gatto piange a causa di molti cani.');
    expect(cries(np('DOG', { definiteness: 'all', number: 'plural' }), 'negative')).toBe('il gatto piange per colpa di tutti i cani.');
    expect(cries(np('WOMAN', { definiteness: 'that' }), 'positive')).toBe('il gatto piange grazie a quella donna.');
    expect(cries(np('AFRICA', { definiteness: 'indefinite' }))).toBe("il gatto piange a causa dell'Africa.");
    expect(cries(np('WATER', { definiteness: 'some' }))).toBe("il gatto piange a causa dell'acqua.");
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('WATER', { definiteness: 'some' }) } } }), 'it')).toBe("il gatto viene dall'acqua.");
  });

  test('regression: the definite cause still fuses', () => {
    expect(cries(np('DOG'))).toBe('il gatto piange a causa del cane.');
    expect(cries(np('WOMAN'), 'positive')).toBe('il gatto piange grazie alla donna.');
  });
});

// A65. The French cause heads every noun with the definite contractions `dePrep` / `datPrep`
// ("à cause du chien", "grâce au chien"), so the noun's own determiner is dropped. With `no` the
// clause still takes "ne" from `hasNegativeComplement`, leaving a stray negator.
describe('known bugs: French cause determiner', () => {
  test('French keeps the cause noun\'s determiner', () => {
    const runsBecauseOf = (value: 'neutral' | 'negative' | 'positive', extra: Parameters<typeof np>[1]) =>
      sayAll(clause(np('CAT'), 'RUN', {
        complements: { cause: { phrase: np('DOG', extra), specifiers: [{ kind: 'sentiment', value }] } },
      })).fr;
    expect(runsBecauseOf('neutral', { definiteness: 'indefinite' })).toBe("le chat court à cause d'un chien.");
    expect(runsBecauseOf('neutral', { definiteness: 'some', number: 'plural' })).toBe('le chat court à cause de quelques chiens.');
    expect(runsBecauseOf('neutral', { definiteness: 'no' })).toBe("le chat ne court à cause d'aucun chien.");
    expect(runsBecauseOf('negative', { definiteness: 'indefinite' })).toBe("le chat court par la faute d'un chien.");
    expect(runsBecauseOf('positive', { definiteness: 'indefinite' })).toBe('le chat court grâce à un chien.');
  });

  const criesFr = (value: CauseSentiment, phrase: NounElement) =>
    sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } })).fr;

  test('French keeps the rest of the determiners, and a continent keeps its article', () => {
    expect(criesFr('neutral', np('DOG', { definiteness: 'many', number: 'plural' }))).toBe('le chat pleure à cause de beaucoup de chiens.');
    expect(criesFr('negative', np('DOG', { definiteness: 'all', number: 'plural' }))).toBe('le chat pleure par la faute de tous les chiens.');
    expect(criesFr('neutral', np('WOMAN', { definiteness: 'no' }))).toBe("le chat ne pleure à cause d'aucune femme.");
    expect(criesFr('neutral', np('AFRICA', { definiteness: 'indefinite' }))).toBe("le chat pleure à cause de l'Afrique.");
  });

  test('French keeps the determiners inside a group that shares its connector', () => {
    expect(criesFr('neutral', { conjuncts: [np('DOG', { definiteness: 'indefinite' }), np('SECOND_PERSON')], conjunction: 'and' }))
      .toBe("le chat pleure à cause d'un chien et de toi.");
    expect(criesFr('positive', { conjuncts: [np('SECOND_PERSON'), np('WOMAN', { definiteness: 'this' })], conjunction: 'and' }))
      .toBe('le chat pleure grâce à toi et à cette femme.');
  });

  test('regression: the definite cause still contracts', () => {
    expect(criesFr('neutral', np('DOG'))).toBe('le chat pleure à cause du chien.');
    expect(criesFr('positive', np('WOMAN'))).toBe('le chat pleure grâce à la femme.');
  });
});

// A65. The noun branch of the Spanish cause renders its connector with `dePrep` / `datPrep`. Both
// always use the definite article. `deDet` / `aDet`, which the source and terminus branches use,
// are never called, so every cause comes out definite whatever its determiner. For `no` the
// preverbal negator still fires, so the sentence means the opposite.
describe('known bugs: Spanish cause determiner', () => {
  test("Spanish keeps the cause's own determiner", () => {
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', { definiteness: 'indefinite' }) } },
    })).es).toBe('el gato llora a causa de un perro.');
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', { definiteness: 'some' }) } },
    })).es).toBe('el gato llora a causa de algunos perros.');
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', { definiteness: 'no' }) } },
    })).es).toBe('el gato no llora a causa de ningún perro.');
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', { definiteness: 'indefinite' }), specifiers: [{ kind: 'sentiment', value: 'positive' }] } },
    })).es).toBe('el gato llora gracias a un perro.');
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', { definiteness: 'indefinite' }), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    })).es).toBe('el gato llora por culpa de un perro.');
  });

  const criesEs = (value: CauseSentiment, phrase: NounElement) =>
    sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } })).es;

  test('Spanish keeps the rest of the determiners, including inside a group that shares its connector', () => {
    expect(criesEs('neutral', np('DOG', { definiteness: 'many', number: 'plural' }))).toBe('el gato llora a causa de muchos perros.');
    expect(criesEs('positive', np('WOMAN', { definiteness: 'that' }))).toBe('el gato llora gracias a esa mujer.');
    expect(criesEs('neutral', np('WOMAN', { definiteness: 'no' }))).toBe('el gato no llora a causa de ninguna mujer.');
    expect(criesEs('neutral', { conjuncts: [np('DOG', { definiteness: 'indefinite' }), np('SECOND_PERSON')], conjunction: 'and' }))
      .toBe('el gato llora a causa de un perro y de ti.');
  });

  test('regression: the definite cause still contracts, and a proper name stays bare', () => {
    expect(criesEs('neutral', np('DOG'))).toBe('el gato llora a causa del perro.');
    expect(criesEs('positive', np('WOMAN'))).toBe('el gato llora gracias a la mujer.');
    expect(criesEs('neutral', np('AFRICA', { definiteness: 'indefinite' }))).toBe('el gato llora a causa de África.');
  });
});

// A65. The Portuguese noun cause fuses its connector with the definite article (`dePrep` /
// `datPrep`) whatever determiner the cause carries. An indefinite, demonstrative or quantified cause
// turns definite, and a "nenhum" cause keeps its "não" but loses "nenhum", which reverses the
// meaning ("the cat does not cry because of the dog").
describe('known bugs: Portuguese cause determiner', () => {
  const criesBecauseOf = (definiteness: Parameters<typeof np>[1], value: 'neutral' | 'negative' | 'positive' = 'neutral') =>
    sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np('DOG', definiteness), specifiers: [{ kind: 'sentiment', value }] } },
    })).pt;

  test('Portuguese keeps the cause\'s own determiner', () => {
    expect(criesBecauseOf({ definiteness: 'indefinite' })).toBe('o gato chora por causa de um cão.');
    expect(criesBecauseOf({ definiteness: 'this' })).toBe('o gato chora por causa deste cão.');
    expect(criesBecauseOf({ definiteness: 'no' })).toBe('o gato não chora por causa de nenhum cão.');
    expect(criesBecauseOf({ definiteness: 'some' })).toBe('o gato chora por causa de alguns cães.');
    expect(criesBecauseOf({ definiteness: 'indefinite' }, 'negative')).toBe('o gato chora por culpa de um cão.');
    expect(criesBecauseOf({ definiteness: 'this' }, 'positive')).toBe('o gato chora graças a este cão.');
  });

  const criesPt = (value: CauseSentiment, phrase: NounElement) =>
    sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } })).pt;

  test('Portuguese keeps the rest of the determiners, including inside a group that shares its connector', () => {
    expect(criesPt('neutral', np('DOG', { definiteness: 'many', number: 'plural' }))).toBe('o gato chora por causa de muitos cães.');
    expect(criesPt('negative', np('DOG', { definiteness: 'all', number: 'plural' }))).toBe('o gato chora por culpa de todos os cães.');
    expect(criesPt('positive', np('WOMAN', { definiteness: 'that' }))).toBe('o gato chora graças a essa mulher.');
    expect(criesPt('neutral', { conjuncts: [np('DOG', { definiteness: 'indefinite' }), np('SECOND_PERSON')], conjunction: 'and' }))
      .toBe('o gato chora por causa de um cão e de você.');
  });

  test('regression: the definite cause and a continent still contract', () => {
    expect(criesPt('neutral', np('DOG'))).toBe('o gato chora por causa do cão.');
    expect(criesPt('positive', np('WOMAN'))).toBe('o gato chora graças à mulher.');
    expect(criesPt('neutral', np('AFRICA', { definiteness: 'indefinite' }))).toBe('o gato chora por causa da África.');
  });
});

// A105. The Portuguese pronoun cause fuses "de" with its tonic pronoun only when the pronoun
// starts with e- (dele, dela, deles). The neuter THIRD_PERSON is "isso", which fuses just as
// obligatorily (de + isso → disso), so it comes out as the unfused "de isso".
describe('known bugs: Portuguese neuter pronoun cause', () => {
  test('Portuguese fuses "de" with "isso"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('THIRD_PERSON', { gender: 'neut' }) } } })).pt)
      .toBe('o gato chora por causa disso.');
  });

  test('Portuguese fuses "disso" in a group and keeps the unfused persons', () => {
    const cry = (phrase: NonNullable<NonNullable<Parameters<typeof clause>[2]>['complements']>['cause']) => sayAll(clause(np('CAT'), 'CRY', { complements: { cause: phrase } })).pt;
    expect(cry({ phrase: { conjuncts: [np('THIRD_PERSON', { gender: 'neut' }), np('DOG')], conjunction: 'and' } })).toBe('o gato chora por causa disso e do cão.');
    expect(cry({ phrase: np('THIRD_PERSON') })).toBe('o gato chora por causa dele.');
    expect(cry({ phrase: np('FIRST_PERSON') })).toBe('o gato chora por causa de mim.');
    expect(cry({ phrase: np('SECOND_PERSON') })).toBe('o gato chora por causa de você.');
  });
});

// A54 (English). The `cause` branch of `complementsPhrase` reads pronoun-vs-noun from the first
// conjunct: a pronoun first renders every conjunct as a bare disjunctive ("him and dog"), a noun
// first renders a following pronoun as a noun ("the dog and the he").
describe('known bugs: English cause with coordinated pronouns', () => {
  test('English renders each cause conjunct in its own form', () => {
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('DOG'), np('THIRD_PERSON')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'neutral' }] } } }), 'en')).toBe('the cat runs because of the dog and him.');
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('THIRD_PERSON'), np('DOG')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'neutral' }] } } }), 'en')).toBe('the cat runs because of him and the dog.');
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('THIRD_PERSON'), np('DOG')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'negative' }] } } }), 'en')).toBe('the cat runs through the fault of him and the dog.');
  });

  const runs = (value: CauseSentiment, ...conjuncts: NounPhrase[]) =>
    say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } } }), 'en');

  test('English shares the connector across pronouns and nouns under every sentiment', () => {
    expect(runs('neutral', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('the cat runs because of me and you.');
    expect(runs('positive', np('MAN'), np('THIRD_PERSON', { number: 'plural' }))).toBe('the cat runs thanks to the man and them.');
    expect(runs('negative', np('DOG'), np('SECOND_PERSON'))).toBe('the cat runs through the fault of the dog and you.');
    expect(runs('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('the cat runs because of the dog, me and the mouse.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runs('neutral', np('FIRST_PERSON'))).toBe('the cat runs because of me.');
    expect(runs('negative', np('THIRD_PERSON', { gender: 'fem' }))).toBe('the cat runs through the fault of her.');
    expect(runs('neutral', np('DOG'), np('MOUSE'))).toBe('the cat runs because of the dog and the mouse.');
  });
});

// A54 (Italian). The cause reads pronoun-vs-noun from the first conjunct. A pronoun first returns
// that pronoun's form alone ("grazie a me", "a causa tua") and drops every other conjunct. A noun
// first sends a following pronoun down the noun path ("a causa del tu").
describe('known bugs: Italian cause with coordinated pronouns', () => {
  const runs = (value: 'neutral' | 'negative' | 'positive', ...conjuncts: ReturnType<typeof np>[]) =>
    say(clause(np('CAT'), 'RUN', {
      complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } },
    }), 'it');

  test('Italian renders each cause conjunct in its own form', () => {
    expect(runs('positive', np('FIRST_PERSON'), np('SECOND_PERSON'))).toMatch(/^il gatto corre grazie a me e (?:grazie )?a te\.$/);
    expect(runs('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toMatch(/^il gatto corre per colpa mia e (?:per colpa )?tua\.$/);
    expect(runs('neutral', np('SECOND_PERSON'), np('DOG'))).toMatch(/^il gatto corre a causa tua e (?:a causa )?del cane\.$/);
    expect(runs('neutral', np('DOG'), np('SECOND_PERSON'))).toBe('il gatto corre a causa del cane e a causa tua.');
  });

  test('Italian repeats the connector per conjunct, a pronoun taking its possessive or tonic form', () => {
    expect(runs('neutral', np('DOG'), np('THIRD_PERSON'))).toBe('il gatto corre a causa del cane e a causa sua.');
    expect(runs('positive', np('MAN'), np('THIRD_PERSON', { number: 'plural' }))).toBe('il gatto corre grazie all\'uomo e grazie a loro.');
    expect(runs('negative', np('SECOND_PERSON'), np('DOG'))).toBe('il gatto corre per colpa tua e per colpa del cane.');
    expect(runs('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('il gatto corre a causa del cane, a causa mia e a causa del topo.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runs('neutral', np('FIRST_PERSON'))).toBe('il gatto corre a causa mia.');
    expect(runs('positive', np('THIRD_PERSON', { number: 'plural' }))).toBe('il gatto corre grazie a loro.');
    expect(runs('neutral', np('DOG'), np('MOUSE'))).toBe('il gatto corre a causa del cane e a causa del topo.');
  });
});

// A54 (French). The `cause` branch of `complementsPhrase` reads the pronoun-vs-noun choice off the
// first conjunct: a leading pronoun renders only itself and drops the rest ("à cause de moi"), a
// leading noun sends a following pronoun down the noun path ("à cause du tu").
describe('known bugs: French cause with coordinated pronouns', () => {
  test('French renders every cause conjunct in its own form', () => {
    const runsBecauseOf = (value: 'neutral' | 'negative' | 'positive', ...ids: string[]) =>
      sayAll(clause(np('CAT'), 'RUN', {
        complements: { cause: { phrase: { conjuncts: ids.map((id) => np(id)), conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } },
      })).fr;
    expect(runsBecauseOf('neutral', 'DOG', 'SECOND_PERSON')).toBe('le chat court à cause du chien et de toi.');
    expect(runsBecauseOf('neutral', 'SECOND_PERSON', 'DOG')).toBe('le chat court à cause de toi et du chien.');
    expect(runsBecauseOf('neutral', 'FIRST_PERSON', 'SECOND_PERSON')).toBe('le chat court à cause de moi et de toi.');
    expect(runsBecauseOf('positive', 'FIRST_PERSON', 'SECOND_PERSON')).toBe('le chat court grâce à moi et à toi.');
  });

  const runs = (value: CauseSentiment, ...conjuncts: NounPhrase[]) =>
    sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } } })).fr;

  test('French shares "à cause" / "grâce", each conjunct bringing its own "de" / "à"', () => {
    expect(runs('neutral', np('DOG'), np('THIRD_PERSON'))).toBe('le chat court à cause du chien et de lui.');
    expect(runs('positive', np('MAN'), np('THIRD_PERSON', { number: 'plural' }))).toBe('le chat court grâce à l\'homme et à eux.');
    expect(runs('positive', np('THIRD_PERSON', { gender: 'fem' }), np('HOUSE'))).toBe('le chat court grâce à elle et à la maison.');
    expect(runs('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('le chat court à cause du chien, de moi et de la souris.');
  });

  // The negative connector holds a possessive, so every conjunct repeats it and none is dropped.
  test('French repeats the negative connector per conjunct', () => {
    expect(runs('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('le chat court par ma faute et par ta faute.');
    expect(runs('negative', np('DOG'), np('SECOND_PERSON'))).toBe('le chat court par la faute du chien et par ta faute.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runs('neutral', np('FIRST_PERSON'))).toBe('le chat court à cause de moi.');
    expect(runs('negative', np('THIRD_PERSON', { gender: 'fem' }))).toBe('le chat court par sa faute.');
    expect(runs('neutral', np('DOG'), np('MOUSE'))).toBe('le chat court à cause du chien et à cause de la souris.');
  });
});

// A54 (Spanish). `complementsPhrase` takes the pronoun-cause branch when the FIRST conjunct is a
// pronoun. That branch renders only that conjunct ("gracias a mí") and drops the rest. When the
// first conjunct is a noun, the generic branch renders a following pronoun like a noun ("del yo").
describe('known bugs: Spanish cause with coordinated pronouns', () => {
  test('Spanish renders each cause conjunct in its own form', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { cause: { phrase: { conjuncts: [np('FIRST_PERSON'), np('SECOND_PERSON')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'positive' }] } },
    })).es).toBe('el gato corre gracias a mí y a ti.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { cause: { phrase: { conjuncts: [np('FIRST_PERSON'), np('DOG')], conjunction: 'and' } } },
    })).es).toBe('el gato corre a causa de mí y del perro.');
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { cause: { phrase: { conjuncts: [np('DOG'), np('FIRST_PERSON')], conjunction: 'and' } } },
    })).es).toBe('el gato corre a causa del perro y de mí.');
  });

  const runs = (value: CauseSentiment, ...conjuncts: NounPhrase[]) =>
    sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } } })).es;

  test('Spanish shares "a causa" / "gracias", each conjunct bringing its own "de" / "a"', () => {
    expect(runs('neutral', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('el gato corre a causa de mí y de ti.');
    expect(runs('positive', np('MAN'), np('THIRD_PERSON', { number: 'plural' }))).toBe('el gato corre gracias al hombre y a ellos.');
    expect(runs('positive', np('THIRD_PERSON', { gender: 'fem' }), np('HOUSE'))).toBe('el gato corre gracias a ella y a la casa.');
    expect(runs('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('el gato corre a causa del perro, de mí y del ratón.');
  });

  // The negative connector holds a possessive, so every conjunct repeats it and none is dropped.
  test('Spanish repeats the negative connector per conjunct', () => {
    expect(runs('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('el gato corre por mi culpa y por tu culpa.');
    expect(runs('negative', np('DOG'), np('SECOND_PERSON'))).toBe('el gato corre por culpa del perro y por tu culpa.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runs('positive', np('FIRST_PERSON'))).toBe('el gato corre gracias a mí.');
    expect(runs('negative', np('THIRD_PERSON', { gender: 'fem' }))).toBe('el gato corre por su culpa.');
    expect(runs('neutral', np('DOG'), np('MOUSE'))).toBe('el gato corre a causa del perro y a causa del ratón.');
  });
});

// A54 (Portuguese). The cause branch of `complementsPhrase` reads pronoun-vs-noun from the first
// conjunct. A pronoun first renders only that pronoun and drops every other conjunct; a noun first
// sends a following pronoun down the noun path ("por causa do você").
describe('known bugs: Portuguese cause with coordinated pronouns', () => {
  const criesBecauseOf = (...conjuncts: ReturnType<typeof np>[]) =>
    sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' } } } })).pt;

  test('Portuguese renders each cause conjunct in its own form', () => {
    expect(criesBecauseOf(np('FIRST_PERSON'), np('DOG'))).toBe('o gato chora por causa de mim e do cão.');
    expect(criesBecauseOf(np('DOG'), np('SECOND_PERSON'))).toBe('o gato chora por causa do cão e de você.');
    expect(criesBecauseOf(np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('o gato chora por causa de mim e de você.');
  });

  const runs = (value: CauseSentiment, ...conjuncts: NounPhrase[]) =>
    sayAll(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } } })).pt;

  test('Portuguese shares "por causa" / "graças", each conjunct bringing its own "de" / "a"', () => {
    expect(runs('neutral', np('DOG'), np('THIRD_PERSON'))).toBe('o gato corre por causa do cão e dele.');
    expect(runs('positive', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('o gato corre graças a mim e a você.');
    expect(runs('positive', np('THIRD_PERSON', { gender: 'fem' }), np('HOUSE'))).toBe('o gato corre graças a ela e à casa.');
    expect(runs('neutral', np('DOG'), np('FIRST_PERSON'), np('MOUSE'))).toBe('o gato corre por causa do cão, de mim e do rato.');
  });

  // The negative connector holds a possessive, so every conjunct repeats it and none is dropped.
  test('Portuguese repeats the negative connector per conjunct', () => {
    expect(runs('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('o gato corre por minha culpa e por sua culpa.');
    expect(runs('negative', np('DOG'), np('SECOND_PERSON'))).toBe('o gato corre por culpa do cão e por sua culpa.');
  });

  test('regression: a lone pronoun and a group of nouns are unchanged', () => {
    expect(runs('neutral', np('FIRST_PERSON'))).toBe('o gato corre por causa de mim.');
    expect(runs('negative', np('THIRD_PERSON', { gender: 'fem' }))).toBe('o gato corre por sua culpa.');
    expect(runs('neutral', np('DOG'), np('MOUSE'))).toBe('o gato corre por causa do cão e por causa do rato.');
  });
});
