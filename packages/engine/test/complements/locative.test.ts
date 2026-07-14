import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// Where the action happens — a static place, with no motion implied. Six verbs license it: the
// five intransitives, and HIDE, the only transitive one among them.
const LOCATIVE_VERBS = ['RUN', 'JUMP', 'COME', 'COLLAPSE', 'GO', 'HIDE'];

const inPlace = (verb: string, place: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), verb, {
    // HIDE is transitive, so it is given something to hide.
    ...(verb === 'HIDE' ? { directObject: np('BOOK') } : {}),
    complements: { locative: { phrase: place } },
  }));

describe('locative', () => {
  test('the adposition each language uses for a static place', () => {
    expect(inPlace('RUN')).toEqual({
      en: 'the cat runs in the house.',
      it: 'il gatto corre nella casa.', // in + la = nella
      fr: 'le chat court dans la maison.',
      es: 'el gato corre en la casa.',
      pt: 'o gato corre na casa.', // em + a = na
      de: 'der Kater läuft im Haus.', // in + dem = im, the dative of place
      // Japanese marks the place of an ACTION with で — not に, which is static existence.
      ja: '猫は家で走ります。',
    });
  });

  // The marking belongs to the complement, not the verb: every licensing verb places its action
  // the same way, and only the verb changes.
  test.each(LOCATIVE_VERBS)('%s takes its locative the same way', (verb) => {
    const said = inPlace(verb);

    expect(said.en).toMatch(/ in the house\.$/);
    expect(said.it).toMatch(/ nella casa\.$/);
    expect(said.fr).toMatch(/ dans la maison\.$/);
    expect(said.es).toMatch(/ en la casa\.$/);
    expect(said.pt).toMatch(/ na casa\.$/);
    expect(said.de).toMatch(/ im Haus\.$/);
    expect(said.ja).toMatch(/^猫は家で/);
  });

  test('the five intransitive verbs', () => {
    expect(inPlace('JUMP')).toMatchObject({
      en: 'the cat jumps in the house.',
      it: 'il gatto salta nella casa.',
      de: 'der Kater springt im Haus.',
      ja: '猫は家で跳びます。',
    });

    expect(inPlace('COME')).toMatchObject({
      en: 'the cat comes in the house.',
      it: 'il gatto viene nella casa.',
      de: 'der Kater kommt im Haus.',
    });

    expect(inPlace('COLLAPSE')).toMatchObject({
      en: 'the cat collapses in the house.',
      it: 'il gatto crolla nella casa.',
      fr: "le chat s'effondre dans la maison.", // a reflexive verb in French
      pt: 'o gato desaba na casa.',
    });

    expect(inPlace('GO')).toMatchObject({
      // GO licenses a locative as well as a direction: this is where the going happens, not
      // where it is headed. Contrast direction.test.ts, which gives "goes TO the market".
      en: 'the cat goes in the house.',
      it: 'il gatto va nella casa.',
    });
  });

  test('HIDE — the one transitive verb, so the object and the place both render', () => {
    expect(inPlace('HIDE')).toMatchObject({
      en: 'the cat hides the book in the house.',
      it: 'il gatto nasconde il libro nella casa.',
      fr: 'le chat cache le livre dans la maison.',
      de: 'der Kater versteckt das Buch im Haus.',
      // Japanese puts the place BEFORE the object; both precede the verb.
      ja: '猫は家で本を隠します。',
    });
  });
});

// The place is an ordinary noun phrase, so it declines like one — and each language fuses its
// locative preposition with whatever article results.
describe('locative: the place is a full noun phrase', () => {
  test('the preposition fuses with the article, in every gender', () => {
    expect(inPlace('RUN', np('MARKET'))).toMatchObject({
      it: 'il gatto corre nel mercato.', // in + il = nel
      pt: 'o gato corre no mercado.', // em + o = no
      de: 'der Kater läuft im Markt.',
    });
  });

  test('a plural place', () => {
    expect(inPlace('RUN', np('HOUSE', { number: 'plural' }))).toMatchObject({
      en: 'the cat runs in the houses.',
      it: 'il gatto corre nelle case.', // in + le = nelle
      fr: 'le chat court dans les maisons.',
      pt: 'o gato corre nas casas.',
      de: 'der Kater läuft in den Häusern.', // dative plural: den, and the noun takes -n
      ja: '猫は家で走ります。', // no number marking
    });
  });

  test('an indefinite place — nothing to fuse with', () => {
    expect(inPlace('RUN', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'the cat runs in a house.',
      it: 'il gatto corre in una casa.', // bare "in", uncontracted
      fr: 'le chat court dans une maison.',
      de: 'der Kater läuft in einem Haus.',
    });
  });
});

describe('known bugs: locative', () => {
  // A proper noun keeps the article its language fixes for it — correct as a SUBJECT ("l'Europa
  // mangia") — but Italian and French drop that article after a locative preposition:
  //
  //     got   "corre nell'Europa" / "court dans l'Europe"
  //     want  "corre in Europa"   / "court en Europe"
  //
  // The engine applies the proper-noun article rule uniformly, so the fixed article survives into
  // a position that forbids it. Spanish ("en Europa"), German ("in Europa") and Portuguese ("na
  // Europa" — Portuguese genuinely does keep it) are all right.
  test.fails('Italian should say "in Europa", not "nell\'Europa"', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({ it: 'il gatto corre in Europa.' });
  });

  test.fails('French should say "en Europe", not "dans l\'Europe"', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({ fr: 'le chat court en Europe.' });
  });

  test('the other four get the proper noun right', () => {
    expect(inPlace('RUN', np('EUROPE'))).toMatchObject({
      en: 'the cat runs in Europe.',
      es: 'el gato corre en Europa.',
      pt: 'o gato corre na Europa.',
      de: 'der Kater läuft in Europa.',
    });
  });

  // The same weak-masculine (n-declension) miss pinned in direction.test.ts, showing up here too:
  // it is a property of the NOUN, not of the complement, so every complement that puts "Junge"
  // in an oblique case hits it. "im Junge" should be "im Jungen".
  test.fails('German should decline the weak masculine in a locative too: "im Jungen"', () => {
    expect(inPlace('RUN', np('BOY'))).toMatchObject({ de: 'der Kater läuft im Jungen.' });
  });
});
