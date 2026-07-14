import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The goal of a motion — where it is headed. The adposition is chosen by the goal's ANIMACY:
// Italian goes *a* a place but *da* a person, and Iberian Romance and French likewise switch.
const goTo = (goal: NounElement) =>
  sayAll(clause(np('CAT'), 'GO', { complements: { direction: { phrase: goal } } }));

const place = (extra: Partial<NounPhrase> = {}) => np('MARKET', extra);
const person = (extra: Partial<NounPhrase> = {}) => np('BOY', extra);

describe('direction', () => {
  test('an inanimate goal', () => {
    expect(goTo(place())).toMatchObject({
      en: 'the cat goes to the market.',
      it: 'il gatto va al mercato.', // a + il
      fr: 'le chat va au marché.',
      de: 'der Kater geht zum Markt.',
      ja: '猫は市場へ行きます。',
    });
  });

  test('an animate goal selects a different adposition', () => {
    expect(goTo(person())).toMatchObject({
      it: 'il gatto va dal ragazzo.', // da, not a
      fr: 'le chat va vers le garçon.', // vers, not à
      es: 'el gato va hacia el niño.', // hacia, not a
      pt: 'o gato vai para o menino.',
    });
  });
});

// A plural goal. What is worth holding here is that the two choices are INDEPENDENT: animacy
// picks the preposition, number picks the article, and each language then fuses the two.
describe('direction: a plural goal', () => {
  test('an inanimate plural goal fuses the preposition with the plural article', () => {
    expect(goTo(place({ number: 'plural' }))).toEqual({
      en: 'the cat goes to the markets.',
      it: 'il gatto va ai mercati.', // a + i = ai
      fr: 'le chat va aux marchés.', // à + les = aux
      es: 'el gato va a los mercados.', // no fusion in the plural
      pt: 'o gato vai aos mercados.', // a + os = aos
      de: 'der Kater geht zu den Märkten.', // dative plural: den, and the noun takes -n
      ja: '猫は市場へ行きます。', // Japanese does not mark number
    });
  });

  test('an animate plural goal keeps the animate preposition', () => {
    // The animacy switch survives pluralisation: Italian fuses *da* with the plural article
    // (da + i = dai), it does not fall back to *a*.
    expect(goTo(person({ number: 'plural' }))).toEqual({
      en: 'the cat goes to the boys.',
      it: 'il gatto va dai ragazzi.', // dai, not ai
      fr: 'le chat va vers les garçons.', // vers does not fuse
      es: 'el gato va hacia los niños.',
      pt: 'o gato vai para os meninos.',
      de: 'der Kater geht zu den Jungen.',
      ja: '猫は男の子へ行きます。',
    });
  });

  test('an indefinite plural goal, of each kind', () => {
    expect(goTo(place({ number: 'plural', definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat goes to markets.',
      it: 'il gatto va a mercati.',
      fr: 'le chat va à des marchés.', // the partitive survives the preposition
      de: 'der Kater geht zu Märkten.',
    });

    expect(goTo(person({ number: 'plural', definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto va da ragazzi.', // still da — bare, so nothing to fuse with
      fr: 'le chat va vers des garçons.',
      es: 'el gato va hacia unos niños.',
    });
  });

  test('a plural goal carries its own adjectives, which agree with it', () => {
    expect(goTo(person({ number: 'plural', adjectives: ['BIG'] }))).toMatchObject({
      en: 'the cat goes to the big boys.',
      it: 'il gatto va dai grandi ragazzi.',
      fr: 'le chat va vers les grands garçons.',
      es: 'el gato va hacia los niños grandes.',
      de: 'der Kater geht zu den großen Jungen.',
    });
  });

  test('goals coordinate, and each conjunct repeats the preposition', () => {
    // Romance repeats the fused preposition per conjunct — "al mercato E ALLA casa" — because
    // each conjunct carries its own article for it to fuse with.
    expect(goTo({ conjuncts: [place(), np('HOUSE')], conjunction: 'and' })).toMatchObject({
      en: 'the cat goes to the market and the house.',
      it: 'il gatto va al mercato e alla casa.',
      fr: 'le chat va au marché et à la maison.',
      de: 'der Kater geht zum Markt und zum Haus.',
      ja: '猫は市場と家へ行きます。',
    });

    // And the animate preposition is repeated in its turn. Italian elides the second one against
    // the vowel of "uomo" (da + l' = dall'). French should do the same against "homme" and does
    // not — see the h-muet bug in nounPhrase.test.ts — so it is left unasserted here.
    expect(goTo({ conjuncts: [person(), np('MAN')], conjunction: 'and' })).toMatchObject({
      it: "il gatto va dal ragazzo e dall'uomo.",
      es: 'el gato va hacia el niño y hacia el hombre.',
    });
  });
});

describe('known bugs: direction', () => {
  // Junge is a weak masculine (n-declension) noun: every case but the nominative singular is
  // "Jungen". The engine misses it — but ONLY in the singular, because the plural happens to be
  // "Jungen" anyway, so "zu den Jungen" above comes out right by coincidence. That is worth
  // knowing: the plural test passing is not evidence the declension works.
  //
  // Fixing it needs a weak-noun class in the corpus (Junge, Herr, Mensch, Student…), since which
  // nouns decline this way is lexical and cannot be derived.
  test.fails('German should decline the weak masculine: "zum Jungen", not "zum Junge"', () => {
    expect(goTo(person())).toMatchObject({ de: 'der Kater geht zum Jungen.' });
  });
});
