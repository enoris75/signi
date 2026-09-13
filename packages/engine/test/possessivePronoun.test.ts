import { describe, expect, test } from 'vitest';
import type { NounGroup, PronominalPossessor } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// A *pronominal* possessor ("the boy and HIS dog") is a possessive pronoun, not a genitive noun
// phrase. It carries only the antecedent's person/number/(natural) gender; the engine spells the
// possessive from those and — in Romance/German — agrees it with the *possessed* head. The
// coreference itself is resolved before the plan is built, so the engine sees pure features.
const pron = (
  person: '1' | '2' | '3',
  number: 'singular' | 'plural',
  gender?: 'masc' | 'fem' | 'neut',
): PronominalPossessor => ({ kind: 'pronominal', person, number, gender });

const dogOf = (poss: PronominalPossessor) => sayAll(clause(np('DOG', { possessor: poss }), 'RUN'));

describe('pronominal possessor', () => {
  // The motivating case: a coordinated subject whose second conjunct is possessed by the first.
  test('"the boy and his dog"', () => {
    const group: NounGroup = {
      conjuncts: [np('BOY'), np('DOG', { possessor: pron('3', 'singular', 'masc') })],
      conjunction: 'and',
    };
    expect(sayAll(clause(group, 'RUN'))).toMatchObject({
      en: 'the boy and his dog run.',
      it: 'il ragazzo e il suo cane corrono.',
      fr: 'le garçon et son chien courent.',
      de: 'der Junge und sein Hund laufen.',
      es: 'el niño y su perro corren.',
      pt: 'o menino e o seu cão correm.',
      ja: '男の子と彼の犬は走ります。',
    });
  });

  test('3rd singular masculine — "his dog"', () => {
    expect(dogOf(pron('3', 'singular', 'masc'))).toMatchObject({
      en: 'his dog runs.',
      it: 'il suo cane corre.',
      fr: 'son chien court.',
      de: 'sein Hund läuft.',
      es: 'su perro corre.',
      pt: 'o seu cão corre.',
      ja: '彼の犬は走ります。',
    });
  });

  // Romance collapses his/her onto one form ("il suo"): the possessive agrees with the possessed,
  // not the antecedent. English/German/Japanese keep the antecedent's gender (her / ihr / 彼女の).
  test('3rd singular feminine — "her dog"', () => {
    expect(dogOf(pron('3', 'singular', 'fem'))).toMatchObject({
      en: 'her dog runs.',
      it: 'il suo cane corre.',
      de: 'ihr Hund läuft.',
      ja: '彼女の犬は走ります。',
    });
  });

  test('3rd plural — "their dog"', () => {
    expect(dogOf(pron('3', 'plural'))).toMatchObject({
      en: 'their dog runs.',
      it: 'il loro cane corre.',
      fr: 'leur chien court.',
      de: 'ihr Hund läuft.',
      es: 'su perro corre.',
      ja: '彼らの犬は走ります。',
    });
  });

  test('1st person — "my dog" / "our dog"', () => {
    expect(dogOf(pron('1', 'singular'))).toMatchObject({
      en: 'my dog runs.',
      it: 'il mio cane corre.',
      fr: 'mon chien court.',
      de: 'mein Hund läuft.',
      es: 'mi perro corre.',
      pt: 'o meu cão corre.',
      ja: '私の犬は走ります。',
    });
    expect(dogOf(pron('1', 'plural'))).toMatchObject({
      en: 'our dog runs.',
      it: 'il nostro cane corre.',
      es: 'nuestro perro corre.',
      pt: 'o nosso cão corre.',
    });
  });

  // The Romance/German possessive agrees with the POSSESSED head's gender/number, regardless of the
  // antecedent: a masculine antecedent possessing the feminine "house" → "la sua casa" / "sa maison".
  test('agrees with the possessed head, not the antecedent (feminine possessed)', () => {
    expect(sayAll(clause(np('HOUSE', { possessor: pron('3', 'singular', 'masc') }), 'BURN'))).toMatchObject({
      it: 'la sua casa brucia.',
      fr: 'sa maison brûle.',
      de: 'sein Haus brennt.', // Haus is neuter → sein (from the possessed head)
      pt: 'a sua casa arde.',
    });
  });

  test('agrees with a plural possessed head — "his books"', () => {
    expect(sayAll(clause(np('BOOK', { number: 'plural', possessor: pron('3', 'singular', 'masc') }), 'BURN'))).toMatchObject({
      en: 'his books burn.',
      it: 'i suoi libri bruciano.',
      fr: 'ses livres brûlent.',
      de: 'seine Bücher brennen.',
      es: 'sus libros arden.',
      pt: 'os seus livros ardem.',
      ja: '彼の本は燃えます。',
    });
  });
});

// A71. `renderNP` swaps the caller's `headFor` for a bare definite article whenever the possessor is
// pronominal. A complement or genitive possessor gets its preposition from `headFor`, so a possessive
// there loses it: "il gatto mangia la mia casa" ("eats my house") for "nella mia casa".
describe('known bugs: Italian pronominal possessor on a complement', () => {
  test.fails('Italian keeps the complement\'s preposition before a possessive', () => {
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) } } }), 'it'))
      .toBe('il gatto dà il libro al tuo cane.');
    expect(say(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'it'))
      .toBe('il gatto mangia nella mia casa.');
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'it'))
      .toBe('il gatto viene dalla mia casa.');
    expect(say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'it'))
      .toBe('il gatto piange a causa del mio cane.');
    expect(say(clause(np('BOOK', { possessor: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }), 'BURN'), 'it'))
      .toBe('il libro del mio cane brucia.');
  });
});

// A71 (French). `renderNP` renders a pronominal possessor's determiner in place of the head the
// complement builds, so the preposition goes with it: "le chat mange ma maison" ("eats my house")
// for "dans ma maison".
describe('known bugs: French pronominal possessor on a complement', () => {
  test.fails('French keeps the complement\'s preposition before a possessive', () => {
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) } } }), 'fr'))
      .toBe('le chat donne le livre à ton chien.');
    expect(say(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'fr'))
      .toBe('le chat mange dans ma maison.');
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'fr'))
      .toBe('le chat vient de ma maison.');
    expect(say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'fr'))
      .toBe('le chat pleure à cause de mon chien.');
    expect(say(clause(np('BOOK', { possessor: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }), 'BURN'), 'fr'))
      .toBe('le livre de mon chien brûle.');
  });
});

// A71 (German). A pronominal possessor on a complement or on a genitive possessor drops the possessive: the complement renders its own determiner ("dem Hund", "im Haus") and the pronominal possessor is never read.
describe('known bugs: German pronominal possessor on a complement', () => {
  test.fails('German keeps the possessive on a complement', () => {
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) } } }), 'de'))
      .toBe('der Kater gibt deinem Hund das Buch.');
    expect(say(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'de'))
      .toBe('der Kater isst in meinem Haus.');
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'de'))
      .toBe('der Kater kommt aus meinem Haus.');
    expect(say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'de'))
      .toBe('der Kater weint wegen meinem Hund.');
    expect(say(clause(np('BOOK', { possessor: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }), 'BURN'), 'de'))
      .toBe('das Buch von meinem Hund brennt.');
  });
});

// A71 (Spanish). A pronominal possessor on a complement or on a genitive possessor drops the possessive: the complement head is built from the definite article ("al perro", "en la casa") and the pronominal possessor is never read.
describe('known bugs: Spanish pronominal possessor on a complement', () => {
  test.fails('Spanish keeps the possessive on a complement', () => {
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) } } }), 'es'))
      .toBe('el gato da el libro a tu perro.');
    expect(say(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'es'))
      .toBe('el gato come en mi casa.');
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'es'))
      .toBe('el gato viene de mi casa.');
    expect(say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'es'))
      .toBe('el gato llora a causa de mi perro.');
    expect(say(clause(np('BOOK', { possessor: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }), 'BURN'), 'es'))
      .toBe('el libro de mi perro arde.');
  });
});

// A71 (Portuguese). A pronominal possessor on a complement or on a genitive possessor drops the possessive: the complement head is built from the definite article ("ao cão", "na casa") and the pronominal possessor is never read.
describe('known bugs: Portuguese pronominal possessor on a complement', () => {
  test.fails('Portuguese keeps the possessive on a complement', () => {
    expect(say(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) } } }), 'pt'))
      .toBe('o gato dá o livro ao seu cão.');
    expect(say(clause(np('CAT'), 'EAT', { complements: { locative: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'pt'))
      .toBe('o gato come na minha casa.');
    expect(say(clause(np('CAT'), 'COME', { complements: { source: { phrase: np('HOUSE', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'pt'))
      .toBe('o gato vem da minha casa.');
    expect(say(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) } } }), 'pt'))
      .toBe('o gato chora por causa do meu cão.');
    expect(say(clause(np('BOOK', { possessor: np('DOG', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }) }), 'BURN'), 'pt'))
      .toBe('o livro do meu cão arde.');
  });
});

// A85. Italian drops the article before a possessive + a singular, unmodified kinship noun ("mio
// padre", "suo padre"), except with "loro". `renderNP` always gives a pronominal possessor the
// definite article, so FATHER reads "il suo padre". The plural, a modified noun and "loro" keep it.
describe('known bugs: Italian possessive before a kinship noun', () => {
  test.fails('Italian drops the article before a possessive + a singular kinship noun', () => {
    expect(say(clause(np('FATHER', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }), 'RUN'), 'it')).toBe('suo padre corre.');
    expect(say(clause(np('FATHER', { possessor: { kind: 'pronominal', person: '1', number: 'plural' } }), 'RUN'), 'it')).toBe('nostro padre corre.');
    expect(say(clause(np('CAT'), 'SEE', { directObject: np('FATHER', { possessor: { kind: 'pronominal', person: '2', number: 'singular' } }) }), 'it')).toBe('il gatto vede tuo padre.');
  });
});
