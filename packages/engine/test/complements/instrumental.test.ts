import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, NounElement, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

// What the action was done with. The instrumental is the one complement with an abstraction
// gradient: the same instrument can be presented as a thing, as an action, or as an action
// nominalised. The two action levels render the verb non-finitely and take `Complement.action`.
//
// Eighteen verbs license it. The direct object is left off throughout: it is not what these are
// about, and dropping it keeps the instrument next to the verb where it can be read.
const INSTRUMENTAL_VERBS = [
  'CUT', 'EAT', 'DRINK', 'SEE', 'KILL', 'READ', 'BEAT',
  'SET_ON_FIRE', 'EXTINGUISH', 'MAKE', 'COMPACT', 'EXPAND', 'START',
  'BUY', 'COORDINATE', 'HIDE', // acquiring / arranging / concealing with a means
  'DESCRIBE', 'MODIFY', // B06 grammar-word verbs
];

const withStick = (verb: string, level: AbstractionLevel) =>
  sayAll(clause(np('CAT'), verb, {
    complements: {
      instrumental: {
        phrase: np('STICK'),
        specifiers: [{ kind: 'abstraction', value: level }],
        // `object` is the reified level: the noun phrase stands alone, so there is no action.
        ...(level === 'object' ? {} : { action: { verb: 'CHOOSE' } }),
      },
    },
  }));

describe('instrumental', () => {
  test('object — the instrument is a thing', () => {
    expect(withStick('CUT', 'object')).toEqual({
      en: 'the cat cuts with the stick.',
      it: 'il gatto taglia con il bastone.',
      fr: 'le chat coupe avec le bâton.',
      es: 'el gato corta con el palo.',
      pt: 'o gato corta com o pau.',
      de: 'der Kater schneidet mit dem Stock.', // mit governs the dative
      ja: '猫は棒で切ります。', // the instrumental particle で
    });
  });

  test('process — the instrument is an action, rendered non-finitely', () => {
    expect(withStick('CUT', 'process')).toEqual({
      en: 'the cat cuts by choosing the stick.',
      it: 'il gatto taglia scegliendo il bastone.', // gerund
      fr: 'le chat coupe en choisissant le bâton.', // en + participle
      es: 'el gato corta eligiendo el palo.',
      pt: 'o gato corta escolhendo o pau.',
      // German has no gerund, so it parts ways completely: a subordinate means clause, verb-final,
      // in the Nachfeld, with an overt subject — the cat, as "er" (B06) — and its noun is a plain
      // direct object, hence ACCUSATIVE ("den Stock"), not the dative that "mit" would have given it.
      de: 'der Kater schneidet, indem er den Stock wählt.',
      ja: '猫は棒を選んで切ります。', // te-form
    });
  });

  test('concept — the action nominalised', () => {
    expect(withStick('CUT', 'concept')).toEqual({
      en: 'the cat cuts with the choosing of the stick.',
      it: 'il gatto taglia con lo scegliere il bastone.',
      fr: 'le chat coupe avec le fait de choisir le bâton.',
      es: 'el gato corta con el elegir el palo.',
      pt: 'o gato corta com o escolher o pau.',
      // Back to a phrase, so back to the dative "mit" — and the nominalised verb takes a genitive.
      de: 'der Kater schneidet mit dem Wählen des Stockes.',
      ja: '猫は棒を選ぶことで切ります。', // ことで
    });
  });
});

// The marking is a property of the COMPLEMENT, not of the verb: every licensing verb takes its
// instrument the same way, and only the verb itself changes. These are the invariants that would
// break if a verb ever grew a special-cased instrumental.
describe('instrumental: every licensing verb', () => {
  test.each(INSTRUMENTAL_VERBS)('%s takes an object-level instrument the same way', (verb) => {
    const said = withStick(verb, 'object');

    expect(said.en).toMatch(/ with the stick\.$/);
    expect(said.it).toMatch(/ con il bastone\.$/);
    expect(said.fr).toMatch(/ avec le bâton\.$/);
    expect(said.es).toMatch(/ con el palo\.$/);
    expect(said.pt).toMatch(/ com o pau\.$/);
    // \S rather than \w: the German verbs here carry umlauts (tötet, schlägt, löscht), and \w
    // is ASCII-only.
    expect(said.de).toMatch(/^der Kater \S+ mit dem Stock\.$/);
    expect(said.ja).toMatch(/^猫は棒で.+ます。$/);
  });

  test.each(INSTRUMENTAL_VERBS)('%s takes a process-level instrument the same way', (verb) => {
    const said = withStick(verb, 'process');

    expect(said.en).toMatch(/ by choosing the stick\.$/);
    expect(said.it).toMatch(/ scegliendo il bastone\.$/);
    expect(said.fr).toMatch(/ en choisissant le bâton\.$/);
    expect(said.es).toMatch(/ eligiendo el palo\.$/);
    // The means clause is clause-final in German, after the verb material.
    expect(said.de).toMatch(/^der Kater \S+, indem er den Stock wählt\.$/);
    // The te-form links the instrument's verb to the main one.
    expect(said.ja).toMatch(/^猫は棒を選んで.+ます。$/);
  });
});

// A few of the thirteen in full, chosen because their lexemes are the awkward ones.
describe('instrumental: the verbs that are not one word', () => {
  test('EXTINGUISH is a phrasal verb in English', () => {
    expect(withStick('EXTINGUISH', 'object')).toMatchObject({
      en: 'the cat puts out with the stick.',
      it: 'il gatto spegne con il bastone.',
      de: 'der Kater löscht mit dem Stock.',
      ja: '猫は棒で消します。',
    });
  });

  test('SET_ON_FIRE is the causative of BURN', () => {
    expect(withStick('SET_ON_FIRE', 'object')).toMatchObject({
      en: 'the cat burns with the stick.',
      es: 'el gato quema con el palo.',
      de: 'der Kater verbrennt mit dem Stock.', // the ver- prefix marks the causative
      ja: '猫は棒で燃やします。',
    });
  });

  test('the app\'s own vocabulary licenses it too', () => {
    // COMPACT / EXPAND / START are the verbs behind Signi's own canvas controls.
    expect(withStick('COMPACT', 'object')).toMatchObject({
      en: 'the cat compacts with the stick.',
      de: 'der Kater verdichtet mit dem Stock.',
      ja: '猫は棒で圧縮します。',
    });
    expect(withStick('EXPAND', 'process')).toMatchObject({
      en: 'the cat expands by choosing the stick.',
      it: 'il gatto espande scegliendo il bastone.',
    });
  });
});

// BUY, COORDINATE and HIDE recently grew an instrumental — the means one buys / arranges / conceals
// with — as did the B06 grammar-word verbs DESCRIBE and MODIFY. Both the object and process levels.
describe('instrumental: the newly-licensing verbs', () => {
  test('BUY, COORDINATE and HIDE take an object-level instrument', () => {
    expect(withStick('BUY', 'object')).toMatchObject({
      en: 'the cat buys with the stick.',
      it: 'il gatto compra con il bastone.',
      de: 'der Kater kauft mit dem Stock.',
      ja: '猫は棒で買います。',
    });
    expect(withStick('COORDINATE', 'object')).toMatchObject({
      en: 'the cat coordinates with the stick.',
      fr: 'le chat coordonne avec le bâton.',
    });
    expect(withStick('HIDE', 'object')).toMatchObject({
      en: 'the cat hides with the stick.',
      de: 'der Kater versteckt mit dem Stock.',
    });
  });

  test('the B06 verbs render the process level too', () => {
    expect(withStick('DESCRIBE', 'process')).toMatchObject({
      en: 'the cat describes by choosing the stick.',
      it: 'il gatto descrive scegliendo il bastone.',
      de: 'der Kater beschreibt, indem er den Stock wählt.',
      ja: '猫は棒を選んで描写します。',
    });
    expect(withStick('MODIFY', 'object')).toMatchObject({
      en: 'the cat modifies with the stick.',
      es: 'el gato modifica con el palo.',
    });
  });
});

// Complement.action is a full verb phrase, but only its verb and its ADVERB are read (an instrument
// has no tense/mood of its own — it takes them from the clause). The adverb attaches to the
// non-finite action — the gerund / te-form / indem-clause — not to the matrix verb.
describe('instrumental: an adverb on the action', () => {
  const cutChoosing = (level: 'process' | 'concept', adverb: string) =>
    sayAll(clause(np('CAT'), 'CUT', {
      complements: {
        instrumental: {
          phrase: np('STICK'),
          specifiers: [{ kind: 'abstraction', value: level }],
          action: { verb: 'CHOOSE', modifier: adverb },
        },
      },
    }));

  test('a manner adverb attaches to the process-level gerund', () => {
    expect(cutChoosing('process', 'WELL')).toEqual({
      en: 'the cat cuts by choosing the stick well.',
      it: 'il gatto taglia scegliendo il bastone bene.',
      fr: 'le chat coupe en choisissant le bâton bien.',
      es: 'el gato corta eligiendo el palo bien.',
      pt: 'o gato corta escolhendo o pau bem.',
      // German drops it into the indem-clause, preverbally (the clause is verb-final): "gut wählt".
      de: 'der Kater schneidet, indem er den Stock gut wählt.',
      ja: '猫は棒をよく選んで切ります。', // よく attaches to the te-form action
    });
  });

  test('a different adverb changes only the action', () => {
    expect(cutChoosing('process', 'FAST')).toMatchObject({
      en: 'the cat cuts by choosing the stick fast.',
      it: 'il gatto taglia scegliendo il bastone velocemente.',
      de: 'der Kater schneidet, indem er den Stock schnell wählt.',
      ja: '猫は棒を速く選んで切ります。',
    });
  });

  test('at the concept level German turns the adverb into an adjective on the nominalisation', () => {
    // A nominalised verb ("das Wählen") takes an ADJECTIVE, not an adverb: German declines "gut" →
    // "guten" inside the noun phrase ("mit dem guten Wählen"). The others keep it as an adverb.
    expect(cutChoosing('concept', 'WELL')).toMatchObject({
      en: 'the cat cuts with the choosing of the stick well.',
      it: 'il gatto taglia con lo scegliere il bastone bene.',
      de: 'der Kater schneidet mit dem guten Wählen des Stockes.',
      ja: '猫は棒をよく選ぶことで切ります。',
    });
  });

  test('the adverb is what adds the word — without it the action is bare', () => {
    const bare = sayAll(clause(np('CAT'), 'CUT', {
      complements: {
        instrumental: {
          phrase: np('STICK'),
          specifiers: [{ kind: 'abstraction', value: 'process' }],
          action: { verb: 'CHOOSE' },
        },
      },
    }));
    expect(bare.en).toBe('the cat cuts by choosing the stick.');
    expect(cutChoosing('process', 'WELL').en).not.toBe(bare.en);
  });
});

// B06, fixed. German's means clause needs an overt subject (it cannot drop one the way a gerund
// does), and it names whoever wields the instrument: the clause's own subject, as the personal
// pronoun agreeing with it in person, number and gender, the verb agreeing in turn ("indem ER den
// Stock wählt", "indem ICH den Stock wähle"). It used to be the impersonal "man" throughout — "by ONE
// choosing the stick" — which quietly generalised an action the other six attribute to the cat.
// "man" is kept where the act is nobody's in particular (see de/meansDoer.ts).
describe('German means clause subject', () => {
  test('German should agree the means clause with the subject, not use impersonal "man"', () => {
    expect(withStick('CUT', 'process'))
      .toMatchObject({ de: 'der Kater schneidet, indem er den Stock wählt.' });
  });

  const instrumental = {
    phrase: np('STICK'),
    specifiers: [{ kind: 'abstraction' as const, value: 'process' as const }],
    action: { verb: 'CHOOSE' },
  };
  const cut = (subject: NounElement, extra: Partial<PhrasePlan> = {}) =>
    say({ ...clause(subject, 'CUT', { complements: { instrumental } }), ...extra }, 'de');

  test('the pronoun agrees with the subject in person, number and gender, and its verb with it', () => {
    expect({
      i: cut(np('FIRST_PERSON')),
      we: cut(np('FIRST_PERSON', { number: 'plural' })),
      you: cut(np('SECOND_PERSON')),
      youAll: cut(np('SECOND_PERSON', { number: 'plural' })),
      she: cut(np('THIRD_PERSON', { gender: 'fem' })),
      they: cut(np('THIRD_PERSON', { number: 'plural' })),
      // A noun is referred back to by its grammatical gender.
      femCat: cut(np('CAT', { gender: 'fem' })),
      child: cut(np('CHILD')),
      cats: cut(np('CAT', { number: 'plural' })),
      // A coordinated subject agrees as its group does: "sie" for 3rd plural, "wir" with an "ich" in it.
      catAndDog: cut({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }),
      meAndDog: cut({ conjuncts: [np('FIRST_PERSON'), np('DOG')], conjunction: 'and' }),
    }).toEqual({
      i: 'ich schneide, indem ich den Stock wähle.',
      we: 'wir schneiden, indem wir den Stock wählen.',
      you: 'du schneidest, indem du den Stock wählst.',
      youAll: 'ihr schneidet, indem ihr den Stock wählt.',
      she: 'sie schneidet, indem sie den Stock wählt.',
      they: 'sie schneiden, indem sie den Stock wählen.',
      femCat: 'die Katze schneidet, indem sie den Stock wählt.',
      child: 'das Kind schneidet, indem es den Stock wählt.',
      cats: 'die Kater schneiden, indem sie den Stock wählen.',
      catAndDog: 'der Kater und der Hund schneiden, indem sie den Stock wählen.',
      meAndDog: 'ich und der Hund schneiden, indem wir den Stock wählen.',
    });
  });

  test('a generic subject keeps "man", which is right there', () => {
    expect(cut(np('GENERIC_PERSON'))).toBe('man schneidet, indem man den Stock wählt.');
  });

  // A command's means clause is its addressee's act; an instruction and a citation are addressed to
  // no one, and German says "man" there as it does on any button ("Beginnen, indem man …").
  test('a command takes its addressee; an instruction and a citation infinitive take "man"', () => {
    const command = (subject: NounElement, extra: Partial<PhrasePlan> = {}) => cut(subject, { imperative: true, ...extra });
    expect(command(np('SECOND_PERSON'))).toBe('schneide, indem du den Stock wählst.');
    expect(command(np('SECOND_PERSON', { number: 'plural' }))).toBe('schneidet, indem ihr den Stock wählt.');
    expect(command(np('FIRST_PERSON', { number: 'plural' }))).toBe('schneiden wir, indem wir den Stock wählen.');
    expect(command(np('SECOND_PERSON'), { verbPhrase: { verb: 'CUT', negative: true } }))
      .toBe('schneide nicht, indem du den Stock wählst.');
    // A coordinated command is addressed to the same person.
    expect(command(np('SECOND_PERSON'), { coordination: { conjunction: 'and', clause: clause(np('CAT'), 'RUN', { complements: { instrumental } }) } }))
      .toBe('schneide, indem du den Stock wählst, und lauf, indem du den Stock wählst.');
    expect(command(np('SECOND_PERSON'), { imperativeRegister: 'instruction' })).toBe('schneiden, indem man den Stock wählt.');
    expect(cut(np('CAT'), { infinitive: true })).toBe('schneiden, indem man den Stock wählt.');
  });

  test('a zu-infinitive and a clause of purpose take their controller', () => {
    expect(say(clause(np('DOG'), 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'CUT' }, complements: { instrumental } } }), 'de'))
      .toBe('der Hund wünscht, zu schneiden, indem er den Stock wählt.');
    expect(say(clause(np('CAT', { gender: 'fem' }), 'RUN', { purpose: { verbPhrase: { verb: 'CUT' }, complements: { instrumental } } }), 'de'))
      .toBe('die Katze läuft, um zu schneiden, indem sie den Stock wählt.');
  });

  // The passive's subject is the patient; the one who wields the instrument is still the agent.
  test('under the passive the agent wields it, and an agentless passive says "man"', () => {
    const cutBy = (agent: string) =>
      say(clause(np(agent), 'CUT', { directObject: np('FOOD'), verbPhrase: { voice: 'passive' }, complements: { instrumental } }), 'de');
    expect(cutBy('CAT')).toBe('das Essen wird vom Kater geschnitten, indem er den Stock wählt.');
    expect(cutBy('GENERIC_PERSON')).toBe('das Essen wird geschnitten, indem man den Stock wählt.');
  });

  test("a relative clause's means clause is its own subject's, the head's in a subject relative", () => {
    const runs = (head: NounPhrase) => say(clause(head, 'RUN'), 'de');
    expect(runs(np('CAT', { gender: 'fem', relative: { verbPhrase: { verb: 'EAT' }, complements: { instrumental } } })))
      .toBe('die Katze, die frisst, indem sie den Stock wählt, läuft.');
    expect(runs(np('MOUSE', { relative: { headRole: 'directObject', subject: np('FIRST_PERSON'), verbPhrase: { verb: 'EAT' }, complements: { instrumental } } })))
      .toBe('die Maus, die ich esse, indem ich den Stock wähle, läuft.');
    // Passive relatives: the agent again, the head itself when the relative is gapped on it.
    expect(runs(np('FOOD', { relative: { headRole: 'directObject', subject: np('CAT', { gender: 'fem' }), verbPhrase: { verb: 'EAT', voice: 'passive' }, complements: { instrumental } } })))
      .toBe('das Essen, das von der Katze gefressen wird, indem sie den Stock wählt, läuft.');
    expect(runs(np('CHILD', { relative: { headRole: 'subject', directObject: np('BOOK'), verbPhrase: { verb: 'WRITE', voice: 'passive' }, complements: { instrumental } } })))
      .toBe('das Kind, von dem das Buch geschrieben wird, indem es den Stock wählt, läuft.');
    expect(runs(np('FOOD', { relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT', voice: 'passive' }, complements: { instrumental } } })))
      .toBe('das Essen, das gegessen wird, indem man den Stock wählt, läuft.');
  });
});
