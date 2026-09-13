import { describe, expect, test } from 'vitest';
import type { CauseSentiment, NounPhrase } from '@signi/shared';
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
      de: 'der Kater wird wegen dem Hund.',
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
      de: 'der Kater erscheint wegen dem Hund.',
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
      .toMatchObject({ en: 'the cat cries because of the dog.', de: 'der Kater weint wegen dem Hund.' });
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

  test.fails('German renders each cause conjunct in its own form', () => {
    expect(runsBecauseOf('neutral', np('MAN'), np('SECOND_PERSON'))).toBe('der Kater läuft wegen dem Mann und dir.');
    expect(runsBecauseOf('neutral', np('SECOND_PERSON'), np('MAN'))).toBe('der Kater läuft wegen dir und dem Mann.');
    expect(runsBecauseOf('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('der Kater läuft durch meine und deine Schuld.');
  });
});

// A65. The Italian cause builds its connector with `prepArt` (preposition + definite article) and
// never reads the complement's determiner, so every pick renders as "del/al". With "no", the
// concord still adds "non" but "nessun" is lost, and the sentence means the opposite.
describe('known bugs: Italian cause determiner', () => {
  const cries = (phrase: ReturnType<typeof np>, value: 'neutral' | 'negative' | 'positive' = 'neutral') =>
    say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase, specifiers: [{ kind: 'sentiment', value }] } } }), 'it');

  test.fails('Italian keeps the cause\'s own determiner', () => {
    expect(cries(np('DOG', { definiteness: 'no' }))).toBe('il gatto non piange a causa di nessun cane.');
    expect(cries(np('DOG', { definiteness: 'indefinite' }))).toBe('il gatto piange a causa di un cane.');
    expect(cries(np('DOG', { definiteness: 'this' }))).toBe('il gatto piange a causa di questo cane.');
    expect(cries(np('DOG', { definiteness: 'bare', number: 'plural' }))).toBe('il gatto piange a causa di cani.');
    expect(cries(np('DOG', { definiteness: 'some', number: 'plural' }), 'negative')).toBe('il gatto piange per colpa di alcuni cani.');
    expect(cries(np('DOG', { definiteness: 'indefinite' }), 'positive')).toBe('il gatto piange grazie a un cane.');
  });
});

// A65. The French cause heads every noun with the definite contractions `dePrep` / `datPrep`
// ("à cause du chien", "grâce au chien"), so the noun's own determiner is dropped. With `no` the
// clause still takes "ne" from `hasNegativeComplement`, leaving a stray negator.
describe('known bugs: French cause determiner', () => {
  test.fails('French keeps the cause noun\'s determiner', () => {
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
});

// A65. The noun branch of the Spanish cause renders its connector with `dePrep` / `datPrep`. Both
// always use the definite article. `deDet` / `aDet`, which the source and terminus branches use,
// are never called, so every cause comes out definite whatever its determiner. For `no` the
// preverbal negator still fires, so the sentence means the opposite.
describe('known bugs: Spanish cause determiner', () => {
  test.fails("Spanish keeps the cause's own determiner", () => {
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

  test.fails('Portuguese keeps the cause\'s own determiner', () => {
    expect(criesBecauseOf({ definiteness: 'indefinite' })).toBe('o gato chora por causa de um cão.');
    expect(criesBecauseOf({ definiteness: 'this' })).toBe('o gato chora por causa deste cão.');
    expect(criesBecauseOf({ definiteness: 'no' })).toBe('o gato não chora por causa de nenhum cão.');
    expect(criesBecauseOf({ definiteness: 'some' })).toBe('o gato chora por causa de alguns cães.');
    expect(criesBecauseOf({ definiteness: 'indefinite' }, 'negative')).toBe('o gato chora por culpa de um cão.');
    expect(criesBecauseOf({ definiteness: 'this' }, 'positive')).toBe('o gato chora graças a este cão.');
  });
});

// A105. The Portuguese pronoun cause fuses "de" with its tonic pronoun only when the pronoun
// starts with e- (dele, dela, deles). The neuter THIRD_PERSON is "isso", which fuses just as
// obligatorily (de + isso → disso), so it comes out as the unfused "de isso".
describe('known bugs: Portuguese neuter pronoun cause', () => {
  test.fails('Portuguese fuses "de" with "isso"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('THIRD_PERSON', { gender: 'neut' }) } } })).pt)
      .toBe('o gato chora por causa disso.');
  });
});

// A54 (English). The `cause` branch of `complementsPhrase` reads pronoun-vs-noun from the first
// conjunct: a pronoun first renders every conjunct as a bare disjunctive ("him and dog"), a noun
// first renders a following pronoun as a noun ("the dog and the he").
describe('known bugs: English cause with coordinated pronouns', () => {
  test.fails('English renders each cause conjunct in its own form', () => {
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('DOG'), np('THIRD_PERSON')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'neutral' }] } } }), 'en')).toBe('the cat runs because of the dog and him.');
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('THIRD_PERSON'), np('DOG')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'neutral' }] } } }), 'en')).toBe('the cat runs because of him and the dog.');
    expect(say(clause(np('CAT'), 'RUN', { complements: { cause: { phrase: { conjuncts: [np('THIRD_PERSON'), np('DOG')], conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value: 'negative' }] } } }), 'en')).toBe('the cat runs through the fault of him and the dog.');
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

  test.fails('Italian renders each cause conjunct in its own form', () => {
    expect(runs('positive', np('FIRST_PERSON'), np('SECOND_PERSON'))).toMatch(/^il gatto corre grazie a me e (?:grazie )?a te\.$/);
    expect(runs('negative', np('FIRST_PERSON'), np('SECOND_PERSON'))).toMatch(/^il gatto corre per colpa mia e (?:per colpa )?tua\.$/);
    expect(runs('neutral', np('SECOND_PERSON'), np('DOG'))).toMatch(/^il gatto corre a causa tua e (?:a causa )?del cane\.$/);
    expect(runs('neutral', np('DOG'), np('SECOND_PERSON'))).toBe('il gatto corre a causa del cane e a causa tua.');
  });
});

// A54 (French). The `cause` branch of `complementsPhrase` reads the pronoun-vs-noun choice off the
// first conjunct: a leading pronoun renders only itself and drops the rest ("à cause de moi"), a
// leading noun sends a following pronoun down the noun path ("à cause du tu").
describe('known bugs: French cause with coordinated pronouns', () => {
  test.fails('French renders every cause conjunct in its own form', () => {
    const runsBecauseOf = (value: 'neutral' | 'negative' | 'positive', ...ids: string[]) =>
      sayAll(clause(np('CAT'), 'RUN', {
        complements: { cause: { phrase: { conjuncts: ids.map((id) => np(id)), conjunction: 'and' }, specifiers: [{ kind: 'sentiment', value }] } },
      })).fr;
    expect(runsBecauseOf('neutral', 'DOG', 'SECOND_PERSON')).toBe('le chat court à cause du chien et de toi.');
    expect(runsBecauseOf('neutral', 'SECOND_PERSON', 'DOG')).toBe('le chat court à cause de toi et du chien.');
    expect(runsBecauseOf('neutral', 'FIRST_PERSON', 'SECOND_PERSON')).toBe('le chat court à cause de moi et de toi.');
    expect(runsBecauseOf('positive', 'FIRST_PERSON', 'SECOND_PERSON')).toBe('le chat court grâce à moi et à toi.');
  });
});

// A54 (Spanish). `complementsPhrase` takes the pronoun-cause branch when the FIRST conjunct is a
// pronoun. That branch renders only that conjunct ("gracias a mí") and drops the rest. When the
// first conjunct is a noun, the generic branch renders a following pronoun like a noun ("del yo").
describe('known bugs: Spanish cause with coordinated pronouns', () => {
  test.fails('Spanish renders each cause conjunct in its own form', () => {
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
});

// A54 (Portuguese). The cause branch of `complementsPhrase` reads pronoun-vs-noun from the first
// conjunct. A pronoun first renders only that pronoun and drops every other conjunct; a noun first
// sends a following pronoun down the noun path ("por causa do você").
describe('known bugs: Portuguese cause with coordinated pronouns', () => {
  const criesBecauseOf = (...conjuncts: ReturnType<typeof np>[]) =>
    sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: { conjuncts, conjunction: 'and' } } } })).pt;

  test.fails('Portuguese renders each cause conjunct in its own form', () => {
    expect(criesBecauseOf(np('FIRST_PERSON'), np('DOG'))).toBe('o gato chora por causa de mim e do cão.');
    expect(criesBecauseOf(np('DOG'), np('SECOND_PERSON'))).toBe('o gato chora por causa do cão e de você.');
    expect(criesBecauseOf(np('FIRST_PERSON'), np('SECOND_PERSON'))).toBe('o gato chora por causa de mim e de você.');
  });
});
