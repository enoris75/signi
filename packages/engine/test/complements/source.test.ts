import { describe, expect, test } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// Where a motion started — the ablative. Seven verbs license it: the four motion verbs; LOAD and
// IMPORT, which are Signi's own vocabulary ("load the phrase FROM the container"); and BUY, whose
// source is where the thing was bought ("buys the book FROM the house").
const SOURCE_VERBS = ['RUN', 'JUMP', 'COME', 'GO', 'LOAD', 'IMPORT', 'BUY'];
const TRANSITIVE = new Set(['LOAD', 'IMPORT', 'BUY']);

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

  test('BUY — the source is where the thing was bought', () => {
    expect(from('BUY')).toMatchObject({
      en: 'the cat buys the book from the house.',
      it: 'il gatto compra il libro dalla casa.',
      fr: 'le chat achète le livre de la maison.',
      de: 'der Kater kauft das Buch aus dem Haus.',
      ja: '猫は家から本を買います。',
    });
  });
});

// Italian, French, Spanish and Portuguese in full. Each fuses its ablative preposition (da / de)
// with the article, and that machinery — the part these cases exist to test — is CORRECT.
//
// These use COME, a verb whose `source` is an origin, not a departure, so it renders bare "da"/"de"
// with NO ablative adverb (see the per-verb condition below, formerly a documented simplification).
// The contraction is the invariant under test: da+la→dalla, de+le→du, da+l'→dall', across gender,
// number, elision and the indefinite. The adverb belongs only to RUN/JUMP (asserted below).
describe('source: Romance', () => {
  test('the preposition fuses with a feminine singular article', () => {
    expect(from('COME')).toMatchObject({
      it: 'il gatto viene dalla casa.', // da + la = dalla
      fr: 'le chat vient de la maison.', // de la — no fusion in the feminine
      es: 'el gato viene de la casa.',
      pt: 'o gato vem da casa.', // de + a = da
    });
  });

  test('…with a masculine singular article', () => {
    expect(from('COME', np('MARKET'))).toMatchObject({
      it: 'il gatto viene dal mercato.', // da + il = dal
      fr: 'le chat vient du marché.', // de + le = du
      es: 'el gato viene del mercado.', // de + el = del
      pt: 'o gato vem do mercado.', // de + o = do
    });
  });

  test('…with a plural article, of each gender', () => {
    expect(from('COME', np('HOUSE', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene dalle case.', // da + le = dalle
      fr: 'le chat vient des maisons.', // de + les = des
      es: 'el gato viene de las casas.',
      pt: 'o gato vem das casas.', // de + as = das
    });

    expect(from('COME', np('MARKET', { number: 'plural' }))).toMatchObject({
      it: 'il gatto viene dai mercati.', // da + i = dai
      fr: 'le chat vient des marchés.',
      es: 'el gato viene de los mercados.',
      pt: 'o gato vem dos mercados.', // de + os = dos
    });
  });

  test('…and elides before a vowel', () => {
    expect(from('COME', np('ANGEL'))).toMatchObject({
      it: "il gatto viene dall'angelo.", // da + l' = dall'
      fr: "le chat vient de l'ange.",
      es: 'el gato viene del ángel.',
      pt: 'o gato vem do anjo.',
    });
  });

  test('an indefinite origin — nothing to fuse with', () => {
    expect(from('COME', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto viene da una casa.', // bare "da"
      fr: "le chat vient d'une maison.", // de + une → d'une
      es: 'el gato viene de una casa.',
      pt: 'o gato vem de uma casa.',
    });
  });
});

// Romance gates the ablative adverb ("via da", "loin de", "lejos de", "longe de") on the verb.
// It exists to keep source and direction apart on the shared preposition: "corro dal bambino" is
// motion TO the boy, so "corro via dal bambino" is what forces the AWAY reading. But only the
// self-propelled motion verbs (RUN/JUMP) need that disambiguation. On the other four it inverts
// the meaning, so they render bare "da"/"de":
//
//   COME    "il gatto viene dalla casa."            = comes from the house (not "AWAY from")
//   LOAD    "il gatto carica il libro dal contenitore." = loads the book from the container
//   IMPORT  "le chat importe le livre de la maison." = imports the book from the house
//
// LOAD and IMPORT are not motion-away verbs at all — their source is an origin, not a departure —
// and COME/GO read "da"/"de" as an origin unambiguously. See SOURCE_ABLATIVE_ADVERB_VERBS in
// types.ts and the per-verb `sourceAdverb` in it.ts / fr.ts / es.ts / pt.ts. Was B01 / B01b.
describe('source: the ablative adverb is gated on the verb', () => {
  test('a non-departure verb (COME) renders bare "da"/"de", no adverb', () => {
    expect(from('COME')).toMatchObject({
      it: 'il gatto viene dalla casa.',
      fr: 'le chat vient de la maison.',
      es: 'el gato viene de la casa.',
      pt: 'o gato vem da casa.',
    });
  });

  test('GO likewise takes no ablative adverb', () => {
    expect(from('GO')).toMatchObject({
      it: 'il gatto va dalla casa.',
      fr: 'le chat va de la maison.',
      es: 'el gato va de la casa.',
      pt: 'o gato vai da casa.',
    });
  });

  test('the transitive LOAD is an origin, not a departure — no adverb', () => {
    expect(from('LOAD', np('CONTAINER'))).toMatchObject({
      it: 'il gatto carica il libro dal contenitore.',
      fr: 'le chat charge le livre du récipient.',
      es: 'el gato carga el libro del recipiente.',
      pt: 'o gato carrega o livro do recipiente.',
    });
  });

  test('IMPORT, the other transitive source verb, also drops the adverb', () => {
    expect(from('IMPORT', np('HOUSE'))).toMatchObject({
      it: 'il gatto importa il libro dalla casa.',
      fr: 'le chat importe le livre de la maison.',
      es: 'el gato importa el libro de la casa.',
      pt: 'o gato importa o livro da casa.',
    });
  });

  test('BUY is an origin, not a departure — bare "da"/"de", no adverb', () => {
    expect(from('BUY')).toMatchObject({
      it: 'il gatto compra il libro dalla casa.',
      fr: 'le chat achète le livre de la maison.',
      es: 'el gato compra el libro de la casa.',
      pt: 'o gato compra o livro da casa.',
    });
  });

  // The disambiguation that motivates the adverb in the first place: it MUST survive on the
  // self-propelled motion verbs, whose "da"/"de" would otherwise be read as a direction-toward goal.
  test('RUN keeps the adverb — the reading the whole mechanism exists to protect', () => {
    expect(from('RUN')).toMatchObject({
      it: 'il gatto corre via dalla casa.',
      fr: 'le chat court loin de la maison.',
      es: 'el gato corre lejos de la casa.',
      pt: 'o gato corre longe da casa.',
    });
  });

  test('JUMP keeps it too, and the article still fuses behind it', () => {
    expect(from('JUMP', np('MARKET'))).toMatchObject({
      it: 'il gatto salta via dal mercato.', // adverb + da + il = via dal
      fr: 'le chat saute loin du marché.', // loin + de + le = loin du
      es: 'el gato salta lejos del mercado.',
      pt: 'o gato pula longe do mercado.',
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
