import { describe, expect, test } from 'vitest';
import type { NounGroup, PronominalPossessor } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

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
