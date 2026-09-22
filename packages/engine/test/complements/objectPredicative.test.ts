import { describe, expect, test } from 'vitest';
import type { NounPhrase, Specifier } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

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

// A224. The Japanese essive として follows a noun as it stands (刑務所として). An adjective head is
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

  test.fails('the stem takes として', () => {
    expect(acquireAs('VALID').ja).toBe('物体を有効として取得する。');
    expect(acquireAs('VALID', np('OBJECT_THING', { definiteness: 'indefinite' })).ja).toBe('物体を有効として取得する。');
    expect(seesAs('HAPPY')).toBe('猫は家を幸せとして見ます。');
    expect(seesAs('VALID', { tense: 'past' })).toBe('猫は家を有効として見ました。');
    expect(seesAs('BROWN')).toBe('猫は家を茶色として見ます。');
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
