import { describe, expect, test } from 'vitest';
import type { Definiteness } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

// The determiner on a COMPLEMENT's noun phrase. The adposition-bearing complements (locative /
// direction / terminus / …) fuse their preposition with a *definite* article ("nella casa", "al
// mercato") but render every other determiner uncontracted ("in una casa", "in nessuna casa", "in
// molte case"). Until now only `definite` / `indefinite` were exercised on these; this file sweeps
// the quantifiers and demonstratives, which the model allows on all of them.
const inHouse = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'RUN', {
    complements: { locative: { phrase: np('HOUSE', { definiteness }) } },
  }));
const toMarket = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'GO', {
    complements: { direction: { phrase: np('MARKET', { definiteness }) } },
  }));
const toDog = (definiteness: Definiteness) =>
  sayAll(clause(np('CAT'), 'GIVE', {
    directObject: np('BOOK'),
    complements: { terminus: { phrase: np('DOG', { definiteness }) } },
  }));

// The locative "in" contracts with nothing but the definite article, so it is the clean axis to
// read the whole determiner set against.
describe('complement determiner: the full set on a locative', () => {
  test('definite — the preposition fuses with the article', () => {
    expect(inHouse('definite')).toMatchObject({
      en: 'the cat runs in the house.',
      it: 'il gatto corre nella casa.', // in + la = nella
      fr: 'le chat court dans la maison.',
      de: 'der Kater läuft im Haus.', // in + dem = im
      es: 'el gato corre en la casa.',
      pt: 'o gato corre na casa.', // em + a = na
    });
  });

  test('indefinite — uncontracted', () => {
    expect(inHouse('indefinite')).toMatchObject({
      en: 'the cat runs in a house.',
      it: 'il gatto corre in una casa.', // bare "in", no fusion
      fr: 'le chat court dans une maison.',
      de: 'der Kater läuft in einem Haus.',
      pt: 'o gato corre em uma casa.', // uncontracted, not "numa"
    });
  });

  test('the demonstratives', () => {
    expect(inHouse('this')).toMatchObject({
      en: 'the cat runs in this house.',
      it: 'il gatto corre in questa casa.',
      fr: 'le chat court dans cette maison.',
      de: 'der Kater läuft in diesem Haus.',
      es: 'el gato corre en esta casa.',
      pt: 'o gato corre nesta casa.', // em + esta = nesta
    });
    expect(inHouse('that')).toMatchObject({
      en: 'the cat runs in that house.',
      it: 'il gatto corre in quella casa.',
      fr: 'le chat court dans cette maison.', // French has no proximal/distal split
      de: 'der Kater läuft in jenem Haus.',
      es: 'el gato corre en esa casa.',
      pt: 'o gato corre nessa casa.', // em + essa = nessa
    });
  });

  test('the quantifiers force the plural, and each language keeps its own quantifier word', () => {
    expect(inHouse('some')).toMatchObject({
      en: 'the cat runs in some houses.',
      it: 'il gatto corre in alcune case.',
      fr: 'le chat court dans quelques maisons.',
      de: 'der Kater läuft in einigen Häusern.',
      es: 'el gato corre en algunas casas.',
      pt: 'o gato corre em algumas casas.',
    });
    expect(inHouse('many')).toMatchObject({
      en: 'the cat runs in many houses.',
      it: 'il gatto corre in molte case.',
      fr: 'le chat court dans beaucoup de maisons.', // "beaucoup DE", not "beaucoup les"
      de: 'der Kater läuft in vielen Häusern.',
      es: 'el gato corre en muchas casas.',
    });
    expect(inHouse('few')).toMatchObject({
      en: 'the cat runs in few houses.',
      it: 'il gatto corre in poche case.',
      fr: 'le chat court dans peu de maisons.',
      pt: 'o gato corre em poucas casas.',
    });
  });

  test('"all" takes the article in Romance, and the plural agrees', () => {
    expect(inHouse('all')).toMatchObject({
      en: 'the cat runs in all houses.',
      it: 'il gatto corre in tutte le case.', // tutte LE — all takes the article
      fr: 'le chat court dans toutes les maisons.',
      de: 'der Kater läuft in allen Häusern.',
      es: 'el gato corre en todas las casas.',
      pt: 'o gato corre em todas as casas.',
    });
  });
});

// The same determiner set on the "a"-marked complements. The point of interest is the fusion:
// only the definite article contracts (a + il = al), everything else stays uncontracted.
describe('complement determiner: fusion is definite-only on direction and terminus', () => {
  test('direction — definite fuses, indefinite does not', () => {
    expect(toMarket('definite')).toMatchObject({
      it: 'il gatto va al mercato.', // a + il = al
      fr: 'le chat va au marché.',
      de: 'der Kater geht zum Markt.', // zu + dem = zum
      pt: 'o gato vai ao mercado.', // a + o = ao
    });
    expect(toMarket('indefinite')).toMatchObject({
      it: 'il gatto va a un mercato.', // bare "a", no fusion
      fr: 'le chat va à un marché.',
      de: 'der Kater geht zu einem Markt.',
      pt: 'o gato vai a um mercado.',
    });
  });

  test('direction — "all" fuses with the plural article in Romance', () => {
    expect(toMarket('all')).toMatchObject({
      it: 'il gatto va a tutti i mercati.', // a + tutti i
      fr: 'le chat va à tous les marchés.',
      de: 'der Kater geht zu allen Märkten.',
      es: 'el gato va a todos los mercados.',
      pt: 'o gato vai a todos os mercados.',
    });
  });

  // German is the interesting one on the terminus: the recipient is a bare DATIVE, so the
  // determiner declines for case (dem / einem / keinem / einigen / vielen / allen) and a plural
  // takes its dative -n ("Hunden") — with no preposition to fuse.
  test('terminus — German declines the determiner for the dative', () => {
    expect(toDog('definite').de).toBe('der Kater gibt dem Hund das Buch.');
    expect(toDog('indefinite').de).toBe('der Kater gibt einem Hund das Buch.');
    expect(toDog('some').de).toBe('der Kater gibt einigen Hunden das Buch.');
    expect(toDog('many').de).toBe('der Kater gibt vielen Hunden das Buch.');
    expect(toDog('all').de).toBe('der Kater gibt allen Hunden das Buch.');
  });
});

// Japanese marks the place with で and does not spell an article, so a complement-phrase determiner
// has no surface there — every determiner renders the locative identically. Correct for the article
// values (Japanese has none); the quantifiers (some / many / no) are silently not expressed, a
// standing limitation rather than a per-value bug. Pinned as current behaviour.
describe('complement determiner: Japanese is determiner-invariant', () => {
  test('every determiner renders the same 家で', () => {
    for (const d of ['definite', 'indefinite', 'this', 'some', 'many', 'all', 'no'] as const) {
      expect(inHouse(d).ja).toBe('猫は家で走ります。');
    }
  });
});

// The negative determiner. English and German negate the phrase once and are done ("in no house",
// "in keinem Haus"); the four Romance languages require NEGATIVE CONCORD — a postverbal negative
// word obliges the preverbal negator (non / ne / no / não). The engine already does this for a
// direct object (below), but does NOT reach it from a complement, so a `no`-determined complement
// drops the negator and comes out ungrammatical.
describe('complement determiner: the negative, and negative concord', () => {
  test('English and German need no concord — a single negation suffices', () => {
    expect(inHouse('no')).toMatchObject({
      en: 'the cat runs in no house.',
      de: 'der Kater läuft in keinem Haus.',
    });
    expect(toMarket('no')).toMatchObject({
      en: 'the cat goes to no market.',
      de: 'der Kater geht zu keinem Markt.',
    });
  });

  // The witness that the machinery exists: a `no`-determined DIRECT OBJECT gets the concord
  // negator in all four Romance languages. This is exactly what the complement path fails to do.
  test('a negative direct object DOES get the concord negator', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE', { definiteness: 'no' }) })))
      .toMatchObject({
        it: 'il gatto non mangia nessun topo.',
        fr: 'le chat ne mange aucune souris.',
        es: 'el gato no come ningún ratón.',
        pt: 'o gato não come nenhum rato.',
      });
  });
});

describe('known bugs: complement negative concord', () => {
  // A postverbal negative word obliges the preverbal negator, and a complement is postverbal — so
  // "il gatto corre in nessuna casa" was ungrammatical; it must be "il gatto NON corre in nessuna
  // casa". The concord now reaches the complement path (as it always did the direct object), in all
  // four Romance languages, on every adposition-bearing complement.
  test('Italian needs "non" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ it: 'il gatto non corre in nessuna casa.' });
  });

  test('French needs "ne" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ fr: 'le chat ne court dans aucune maison.' });
  });

  test('Spanish needs "no" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ es: 'el gato no corre en ninguna casa.' });
  });

  test('Portuguese needs "não" for a negative locative', () => {
    expect(inHouse('no')).toMatchObject({ pt: 'o gato não corre em nenhuma casa.' });
  });

  // And it is not specific to the locative — the same concord on a `direction` goal.
  test('the concord fires on a negative direction goal too', () => {
    expect(toMarket('no')).toMatchObject({
      it: 'il gatto non va a nessun mercato.',
      fr: 'le chat ne va à aucun marché.',
      es: 'el gato no va a ningún mercado.',
      pt: 'o gato não vai a nenhum mercado.',
    });
  });

  // …and on a `terminus`, even alongside a (positive) direct object — the negative complement alone
  // obliges the negator ("non dà il libro a nessun cane").
  test('the concord fires on a negative terminus with a direct object present', () => {
    expect(toDog('no')).toMatchObject({
      it: 'il gatto non dà il libro a nessun cane.',
      fr: 'le chat ne donne le livre à aucun chien.',
      es: 'el gato no da el libro a ningún perro.',
      pt: 'o gato não dá o livro a nenhum cão.',
    });
  });

  // A negative verb AND a negative complement together take a SINGLE negator, not two.
  test('a negative verb and a negative complement do not double the negator', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      verbPhrase: { negative: true },
      complements: { locative: { phrase: np('HOUSE', { definiteness: 'no' }) } },
    }))).toMatchObject({
      it: 'il gatto non corre in nessuna casa.',
      fr: 'le chat ne court dans aucune maison.',
    });
  });

  // Regression: a positive (definite) complement adds no negator.
  test('a positive complement takes no concord negator', () => {
    expect(inHouse('definite')).toMatchObject({
      it: 'il gatto corre nella casa.',
      es: 'el gato corre en la casa.',
    });
  });
});
