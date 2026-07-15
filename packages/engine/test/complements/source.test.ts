import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// Where a motion started — the ablative. Six verbs license it: the four motion verbs, and LOAD
// and IMPORT, which are Signi's own vocabulary ("load the phrase FROM the container").
const SOURCE_VERBS = ['RUN', 'JUMP', 'COME', 'GO', 'LOAD', 'IMPORT'];
const TRANSITIVE = new Set(['LOAD', 'IMPORT']);

const from = (verb: string, place: NounPhrase = np('HOUSE')) =>
  sayAll(clause(np('CAT'), verb, {
    ...(TRANSITIVE.has(verb) ? { directObject: np('BOOK') } : {}),
    complements: { source: { phrase: place } },
  }));

describe('source', () => {
  test('English, German and Japanese take a dedicated ablative adposition', () => {
    expect(from('COME')).toMatchObject({
      en: 'the cat comes from the house.',
      de: 'der Kater kommt aus dem Haus.', // aus, not von
      ja: '猫は家から来ます。', // から
    });
  });

  // The marking belongs to the complement, not the verb: every licensing verb marks its origin
  // the same way, and only the verb changes.
  test.each(SOURCE_VERBS)('%s marks its origin the same way', (verb) => {
    const said = from(verb);

    expect(said.en).toMatch(/ from the house\.$/);
    expect(said.de).toMatch(/ aus dem Haus\.$/);
    expect(said.ja).toMatch(/^猫は家から/);
    // Romance keeps the fused preposition at the end, behind its ablative adverb (see below).
    expect(said.it).toMatch(/ dalla casa\.$/);
    expect(said.fr).toMatch(/ de la maison\.$/);
    expect(said.es).toMatch(/ de la casa\.$/);
    expect(said.pt).toMatch(/ da casa\.$/);
  });

  test('the four motion verbs', () => {
    expect(from('RUN')).toMatchObject({
      en: 'the cat runs from the house.',
      de: 'der Kater läuft aus dem Haus.',
      ja: '猫は家から走ります。',
    });
    expect(from('JUMP')).toMatchObject({
      en: 'the cat jumps from the house.',
      de: 'der Kater springt aus dem Haus.',
    });
    expect(from('GO')).toMatchObject({
      en: 'the cat goes from the house.',
      de: 'der Kater geht aus dem Haus.',
    });
  });

  test('LOAD and IMPORT — the transitive pair, so the object renders too', () => {
    expect(from('LOAD')).toMatchObject({
      en: 'the cat loads the book from the house.',
      de: 'der Kater lädt das Buch aus dem Haus.',
      ja: '猫は家から本を読み込みます。',
    });

    expect(from('IMPORT')).toMatchObject({
      en: 'the cat imports the book from the house.',
      de: 'der Kater importiert das Buch aus dem Haus.',
      ja: '猫は家から本を取り込みます。',
    });

    // The app's real sentence: loading something out of a container.
    expect(from('LOAD', np('CONTAINER'))).toMatchObject({
      en: 'the cat loads the book from the container.',
      de: 'der Kater lädt das Buch aus dem Behälter.',
      ja: '猫は容器から本を読み込みます。',
    });
  });
});

// Italian, French, Spanish and Portuguese in full. Each fuses its ablative preposition (da / de)
// with the article, and that machinery is CORRECT — it is only the adverb in front of it that is
// not (see the documented simplification below).
//
// These assert the current output, adverb and all. If the simplification is ever undone, BOTH
// these and the `test.fails` below have to change: the contraction is the part that must survive.
describe('source: Romance', () => {
  test('the preposition fuses with a feminine singular article', () => {
    expect(from('COME')).toMatchObject({
      it: 'il gatto viene via dalla casa.', // da + la = dalla
      fr: 'le chat vient loin de la maison.', // de la — no fusion in the feminine
      es: 'el gato viene lejos de la casa.',
      pt: 'o gato vem longe da casa.', // de + a = da
    });
  });

  test('…with a masculine singular article', () => {
    expect(from('COME', np('MARKET'))).toMatchObject({
      it: 'il gatto viene via dal mercato.', // da + il = dal
      fr: 'le chat vient loin du marché.', // de + le = du
      es: 'el gato viene lejos del mercado.', // de + el = del
      pt: 'o gato vem longe do mercado.', // de + o = do
    });
  });

  test('…with a plural article, of each gender', () => {
    expect(from('COME', np('HOUSE', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene via dalle case.', // da + le = dalle
      fr: 'le chat vient loin des maisons.', // de + les = des
      es: 'el gato viene lejos de las casas.',
      pt: 'o gato vem longe das casas.', // de + as = das
    });

    expect(from('COME', np('MARKET', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene via dai mercati.', // da + i = dai
      fr: 'le chat vient loin des marchés.',
      es: 'el gato viene lejos de los mercados.',
      pt: 'o gato vem longe dos mercados.', // de + os = dos
    });
  });

  test('…and elides before a vowel', () => {
    expect(from('COME', np('ANGEL'))).toMatchObject({
      it: "il gatto viene via dall'angelo.", // da + l' = dall'
      fr: "le chat vient loin de l'ange.",
      es: 'el gato viene lejos del ángel.',
      pt: 'o gato vem longe do anjo.',
    });
  });

  test('an indefinite origin — nothing to fuse with', () => {
    expect(from('COME', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto viene via da una casa.', // bare "da"
      fr: "le chat vient loin d'une maison.", // de + une → d'une
      es: 'el gato viene lejos de una casa.',
      pt: 'o gato vem longe de uma casa.',
    });
  });
});

// DELIBERATE, not an oversight — but read the LOAD/IMPORT note before defending it.
//
// Romance prefixes an ablative adverb ("via da", "loin de", "lejos de", "longe de") because
// source and direction would otherwise collide on the same preposition: "corro dal bambino" is
// motion TO the boy, so "corro via dal bambino" is what forces the AWAY reading. See the comments
// in it.ts / fr.ts / es.ts / pt.ts.
//
// It reads acceptably on a verb of departure ("corre via dalla casa" — runs AWAY from the house).
// It does not survive the other four:
//
//   COME    "il gatto viene via dalla casa."          = comes AWAY from the house
//   LOAD    "il gatto carica il libro via dalla casa." = loads the book AWAY FROM the house
//   IMPORT  "le chat importe le livre loin de la maison." = imports the book FAR FROM the house
//
// LOAD and IMPORT are not motion-away verbs at all — their source is an origin, not a departure —
// so the disambiguation the adverb buys is not needed there, and what it costs is the meaning.
// A per-verb (or per-transitivity) condition on the adverb would keep the RUN/JUMP reading and
// fix the rest.
describe('documented simplifications: source', () => {
  test.fails('Italian source reads as "away from" with a non-departure verb', () => {
    expect(from('COME')).toMatchObject({ it: 'il gatto viene dalla casa.' });
  });

  test.fails('French source reads as "far from" with a non-departure verb', () => {
    expect(from('COME')).toMatchObject({ fr: 'le chat vient de la maison.' });
  });

  test.fails('Spanish source reads as "far from" with a non-departure verb', () => {
    expect(from('COME')).toMatchObject({ es: 'el gato viene de la casa.' });
  });

  test.fails('Portuguese source reads as "far from" with a non-departure verb', () => {
    expect(from('COME')).toMatchObject({ pt: 'o gato vem da casa.' });
  });

  test.fails('LOAD is not a motion verb — the ablative adverb inverts its meaning', () => {
    expect(from('LOAD', np('CONTAINER'))).toMatchObject({
      it: 'il gatto carica il libro dal contenitore.',
      fr: 'le chat charge le livre du récipient.',
    });
  });
});

describe('known bugs: source', () => {
  // The same weak-masculine (n-declension) miss pinned in direction.test.ts and locative.test.ts:
  // it is a property of the NOUN, so every complement that puts "Junge" in an oblique case hits
  // it. "aus dem Junge" should be "aus dem Jungen".
  test('German should decline the weak masculine: "aus dem Jungen"', () => {
    expect(from('COME', np('BOY'))).toMatchObject({ de: 'der Kater kommt aus dem Jungen.' });
  });
});
