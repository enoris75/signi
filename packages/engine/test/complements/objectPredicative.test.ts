import { describe, expect, test } from 'vitest';
import type { NounPhrase, Specifier } from '@signi/shared';
import { clause, furigana, np, say, sayAll } from '../harness.js';

// The OBJECT complement (localization C12) — the subject complement's counterpart on the direct
// object. It says what the object is made into ("transform the house into a prison") or what it is
// taken as ("use the house as the prison"), and it predicates of the OBJECT, which is what its
// adjective head has to agree with.
//
// The two readings are marked differently, and only one of them is lexical: the factitive link
// belongs to the verb (TRANSFORM says "into" / in / en / em / in), the essive word belongs to the
// language (as / come / comme / como / als / として).
const ESSIVE: Specifier[] = [{ kind: 'predication', value: 'essive' }];

const transforms = (phrase: NounPhrase, object: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), 'TRANSFORM', {
    directObject: object,
    complements: { objectPredicative: { phrase } },
  }));

const uses = (phrase: NounPhrase) =>
  sayAll(clause(np('CAT'), 'USE', {
    directObject: np('HOUSE'),
    complements: { objectPredicative: { phrase, specifiers: ESSIVE } },
  }));

describe('objectPredicative', () => {
  test('the factitive: what the object is turned into, behind the verb’s own link', () => {
    expect(transforms(np('PRISON', { definiteness: 'indefinite' }))).toEqual({
      en: 'the cat transforms the house into a prison.',
      it: 'il gatto trasforma la casa in una prigione.',
      fr: 'le chat transforme la maison en une prison.',
      de: 'der Kater verwandelt das Haus in ein Gefängnis.',
      es: 'el gato transforma la casa en una prisión.',
      // Japanese marks it with the same に the subject complement takes: 家が刑務所になる under
      // a causer is 家を刑務所にする.
      ja: '猫は家を刑務所に変えます。',
      pt: 'o gato transforma a casa em uma prisão.',
    });
  });

  test('the link fuses with a definite article exactly as a preposition does', () => {
    // Definite by hand: like the subject complement, this slot defaults to INDEFINITE — it
    // ascribes a class to the object rather than picking a referent out (defaultDefiniteness).
    expect(transforms(np('PRISON', { definiteness: 'definite' }))).toMatchObject({
      it: 'il gatto trasforma la casa nella prigione.', // in + la
      de: 'der Kater verwandelt das Haus ins Gefängnis.', // in + das, accusative
      pt: 'o gato transforma a casa na prisão.', // em + a
      es: 'el gato transforma la casa en la prisión.', // Spanish fuses only a/de with "el"
    });
  });

  test('an adjective head agrees with the OBJECT, and takes no link at all', () => {
    // "makes the house beautiful", never "*into beautiful" — the link introduces a noun. The
    // house is feminine in the four Romance languages, so the adjective is too.
    expect(transforms(np('BEAUTIFUL'))).toEqual({
      en: 'the cat transforms the house beautiful.',
      it: 'il gatto trasforma la casa bella.',
      fr: 'le chat transforme la maison belle.',
      de: 'der Kater verwandelt das Haus schön.', // a German predicate adjective is uninflected
      es: 'el gato transforma la casa hermosa.',
      ja: '猫は家を美しく変えます。', // the adverbial く-form, as a subject complement takes
      pt: 'o gato transforma a casa bela.',
    });
  });

  test('a masculine object pulls the adjective the other way', () => {
    expect(transforms(np('BEAUTIFUL'), np('BOOK'))).toMatchObject({
      it: 'il gatto trasforma il libro bello.',
      fr: 'le chat transforme le livre beau.',
      es: 'el gato transforma el libro hermoso.',
      pt: 'o gato transforma o livro belo.',
    });
  });

  test('the essive: the object is only *taken as* the thing, and the word is the language’s own', () => {
    expect(uses(np('PRISON', { definiteness: 'definite' }))).toEqual({
      en: 'the cat uses the house as the prison.',
      // Outside English the essive names a role rather than picking a referent out, so it drops
      // the article whatever the plan chose: "come prigione", never "come la prigione".
      it: 'il gatto usa la casa come prigione.',
      fr: 'le chat utilise la maison comme prison.',
      de: 'der Kater verwendet das Haus als Gefängnis.',
      es: 'el gato usa la casa como prisión.',
      ja: '猫は家を刑務所として使います。',
      pt: 'o gato usa a casa como prisão.',
    });
  });

  test('a verb that names no link leaves the predicate bare, which only English licenses', () => {
    // MAKE is the plain verb of creation in every language here (fare / hacer / 作る) and licenses
    // no object complement in the seed; this is the shape a lexeme naming no link would take.
    expect(sayAll(clause(np('CAT'), 'MAKE', {
      directObject: np('HOUSE'),
      complements: { objectPredicative: { phrase: np('PRISON', { definiteness: 'indefinite' }) } },
    }))).toMatchObject({ en: 'the cat makes the house a prison.' });
  });
});

// A224. The Japanese essive として follows a noun as it stands (刑務所として). An adjective head was
// rendered as it stands too, which for a na-adjective is its attributive form: 有効なとして, 幸せなとして.
// The な (and the の of a noun-adjective, 茶色の) links a word to a noun after it, and として is no
// noun: the stem takes it, 有効として. The factitive branch above it already cuts the stem, by
// `jaAdjClass` (幸せにする). ACCEPT's C28 gloss stayed on the literal for it.
describe('known bugs: a Japanese na-adjective keeps its な before として (A224)', () => {
  const G = np('GENERIC_PERSON');
  const acquireAs = (adjective: string, object: NounPhrase = np('OBJECT_THING', { definiteness: 'bare', number: 'plural' })) =>
    sayAll({ ...clause(G, 'ACQUIRE', { directObject: object, complements: { objectPredicative: { phrase: np(adjective), specifiers: ESSIVE } } }), infinitive: true });
  const seesAs = (adjective: string, verbPhrase = {}) =>
    sayAll(clause(np('CAT'), 'SEE', { verbPhrase, directObject: np('HOUSE'), complements: { objectPredicative: { phrase: np(adjective), specifiers: ESSIVE } } })).ja;

  test('the stem takes として', () => {
    expect(acquireAs('VALID').ja).toBe('物体を有効として取得する。');
    expect(acquireAs('VALID', np('OBJECT_THING', { definiteness: 'indefinite' })).ja).toBe('物体を有効として取得する。');
    expect(seesAs('HAPPY')).toBe('猫は家を幸せとして見ます。');
    expect(seesAs('VALID', { tense: 'past' })).toBe('猫は家を有効として見ました。');
    expect(seesAs('BROWN')).toBe('猫は家を茶色として見ます。');
  });

  test('more na- and の-adjectives, another verb, the negative and the imperative, and the stem’s own furigana', () => {
    expect(seesAs('LAZY')).toBe('猫は家を怠惰として見ます。');
    expect(seesAs('CAREFUL')).toBe('猫は家を慎重として見ます。');
    expect(seesAs('WILD')).toBe('猫は家を野生として見ます。');
    expect(seesAs('SAVED')).toBe('猫は家を保存済みとして見ます。');
    expect(seesAs('HAPPY', { negative: true })).toBe('猫は家を幸せとして見ません。');
    expect(uses(np('HAPPY')).ja).toBe('猫は家を幸せとして使います。');
    expect(say({
      ...clause(np('SECOND_PERSON'), 'SEE', { directObject: np('HOUSE'), complements: { objectPredicative: { phrase: np('VALID'), specifiers: ESSIVE } } }),
      imperative: true,
    }, 'ja')).toBe('家を有効として見てください。');
    expect(furigana(clause(np('CAT'), 'SEE', {
      directObject: np('HOUSE'), complements: { objectPredicative: { phrase: np('BROWN'), specifiers: ESSIVE } },
    }))).toEqual(['ねこ', 'いえ', 'ちゃいろ', 'みます']);
  });

  test('regression: a noun, the factitive and the other six', () => {
    expect(uses(np('PRISON')).ja).toBe('猫は家を刑務所として使います。');
    expect(sayAll(clause(np('CAT'), 'MAKE', {
      directObject: np('HOUSE'), complements: { objectPredicative: { phrase: np('HAPPY') } },
    })).ja).toBe('猫は家を幸せに作ります。');
    expect(acquireAs('VALID')).toMatchObject({
      en: 'to acquire objects as valid.',
      it: 'acquisire oggetti come validi.',
      fr: 'acquérir des objets comme valides.',
      de: 'Gegenstände als gültig erwerben.',
      es: 'adquirir objetos como válidos.',
      pt: 'adquirir objetos como válidos.',
    });
  });
});

// A231. A225 gave a German predicate ordinal the article and the capital of a nominalised rank, in
// the gender of what it is said of ("das Haus ist das Erste"). The essive object predicate is the
// same predication, said of the object, and still takes the undeclined adjective path: "sieht das
// Haus als erste", where German wants "als das Erste". Found fixing A225.
describe('known bugs: a German ordinal as an essive object predicate is left bare (A231)', () => {
  const seesAs = (subject: string, object: string, ordinal: string) =>
    sayAll(clause(np(subject), 'SEE', { directObject: np(object), complements: { objectPredicative: { phrase: np(ordinal), specifiers: ESSIVE } } }));

  test.fails('the ordinal takes the article and the capital, in the object\'s gender', () => {
    expect(seesAs('CAT', 'HOUSE', 'FIRST').de).toBe('der Kater sieht das Haus als das Erste.');
    expect(seesAs('PERSON', 'OPTION', 'SECOND').de).toBe('die Person sieht die Option als die Zweite.');
  });

  test('regression: the subject predicate (A225) and the other six', () => {
    expect(sayAll(clause(np('HOUSE'), 'BE', { complements: { predicative: { phrase: np('FIRST') } } })).de).toBe('das Haus ist das Erste.');
    expect(sayAll(clause(np('OPTION'), 'BE', { complements: { predicative: { phrase: np('SECOND') } } })).de).toBe('die Option ist die Zweite.');
    expect(seesAs('CAT', 'HOUSE', 'FIRST')).toMatchObject({
      en: 'the cat sees the house as first.',
      it: 'il gatto vede la casa come prima.',
      fr: 'le chat voit la maison comme première.',
      es: 'el gato ve la casa como primera.',
      pt: 'o gato vê a casa como primeira.',
      ja: '猫は家を第一として見ます。',
    });
  });
});

// A232. The Japanese essive として takes a na-adjective's stem (A224), and drops the degree the
// adjective was given: "as happier" is 幸せとして, the positive. The factitive branch writes the
// degree word ahead of the adjective (もっと幸せに), and the other six languages compare it. Found
// fixing A224.
describe('known bugs: the Japanese essive drops an adjective head\'s degree (A232)', () => {
  const seesAs = (adjective: NounPhrase) =>
    sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE'), complements: { objectPredicative: { phrase: adjective, specifiers: ESSIVE } } }));
  const makes = (adjective: NounPhrase) =>
    say(clause(np('CAT'), 'MAKE', { directObject: np('HOUSE'), complements: { objectPredicative: { phrase: adjective } } }), 'ja');

  test.fails('the degree word stands before the stem, as it does in the factitive', () => {
    expect(seesAs(np('HAPPY', { headDegree: 'more' })).ja).toBe('猫は家をもっと幸せとして見ます。');
    expect(seesAs(np('BROWN', { headDegree: 'most' })).ja).toBe('猫は家を最も茶色として見ます。');
  });

  test('regression: the factitive, the positive essive and the other six', () => {
    expect(makes(np('HAPPY', { headDegree: 'more' }))).toBe('猫は家をもっと幸せに作ります。');
    expect(makes(np('HAPPY', { headDegree: 'most' }))).toBe('猫は家を最も幸せに作ります。');
    expect(seesAs(np('HAPPY')).ja).toBe('猫は家を幸せとして見ます。');
    expect(seesAs(np('HAPPY', { headDegree: 'more' }))).toMatchObject({
      en: 'the cat sees the house as happier.',
      de: 'der Kater sieht das Haus als glücklicher.',
      it: 'il gatto vede la casa come più felice.',
      es: 'el gato ve la casa como más feliz.',
    });
  });
});
